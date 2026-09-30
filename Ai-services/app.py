from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from pydantic import BaseModel

import tensorflow as tf
import numpy as np
import io
import requests
import time


app = FastAPI()


# =====================================================
# CORS
# =====================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://derma-detect-ai-six.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =====================================================
# LOAD TFLITE MODELS
# =====================================================

print("========== LOADING TFLITE MODELS ==========")

model_start = time.time()


def load_tflite_model(model_path):

    print(
        "Loading:",
        model_path
    )

    interpreter = tf.lite.Interpreter(
        model_path=model_path
    )

    interpreter.allocate_tensors()

    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()

    print(
        "Loaded:",
        model_path
    )

    return (
        interpreter,
        input_details,
        output_details,
    )


# =====================================================
# MODEL 1
# =====================================================

skin_validator_model = load_tflite_model(
    "skin_validator.tflite"
)


# =====================================================
# MODEL 2
# =====================================================

normal_disease_model = load_tflite_model(
    "normal_disease_model.tflite"
)


# =====================================================
# MODEL 3
# =====================================================

disease_model = load_tflite_model(
    "best_model.tflite"
)


print(
    "ALL TFLITE MODELS LOADED IN:",
    round(time.time() - model_start, 2),
    "seconds",
)


# =====================================================
# LABELS
# =====================================================

skin_validator_classes = [
    "non_skin",
    "normal_skin",
]


normal_disease_classes = [
    "disease",
    "normal_skin",
]


disease_classes = [
    "Acne",
    "Psoriasis",
    "Ringworm",
    "Vitiligo",
]


# =====================================================
# REQUEST MODEL
# =====================================================

class ImageUrlRequest(BaseModel):

    imageUrl: str


# =====================================================
# DOWNLOAD IMAGE
# =====================================================

def download_image(image_url):

    start = time.time()

    print(
        "Downloading image..."
    )

    response = requests.get(
        image_url,
        timeout=30,
    )

    response.raise_for_status()

    print(
        "Image downloaded in:",
        round(
            time.time() - start,
            2,
        ),
        "seconds",
    )

    image = Image.open(
        io.BytesIO(
            response.content
        )
    )

    print(
        "Image format:",
        image.format,
    )

    print(
        "Image dimensions:",
        image.size,
    )

    return image


# =====================================================
# PREPARE IMAGE
# =====================================================

def prepare_image(image):

    image = image.convert(
        "RGB"
    )

    image = image.resize(
        (224, 224)
    )

    image_array = np.array(
        image,
        dtype=np.float32,
    )

    image_array = np.expand_dims(
        image_array,
        axis=0,
    )

    return image_array


# =====================================================
# TFLITE PREDICTION
# =====================================================

def run_tflite_model(
    model_data,
    image_array,
):

    interpreter, input_details, output_details = (
        model_data
    )

    input_index = (
        input_details[0]["index"]
    )

    output_index = (
        output_details[0]["index"]
    )

    interpreter.set_tensor(
        input_index,
        image_array,
    )

    interpreter.invoke()

    output = interpreter.get_tensor(
        output_index
    )

    return output[0]


# =====================================================
# MODEL 1
# SKIN VALIDATOR
# =====================================================

def validate_skin_type(image):

    start = time.time()

    print(
        "Running Skin Validator..."
    )

    image_array = prepare_image(
        image
    )

    predictions = run_tflite_model(
        skin_validator_model,
        image_array,
    )

    index = int(
        np.argmax(predictions)
    )

    predicted_class = (
        skin_validator_classes[index]
    )

    confidence = (
        float(predictions[index])
        * 100
    )

    result = {
        "class": predicted_class,
        "confidence": round(
            confidence,
            2,
        ),
    }

    print(
        "Skin Validator result:",
        result,
    )

    print(
        "Skin Validator time:",
        round(
            time.time() - start,
            2,
        ),
        "seconds",
    )

    return result


# =====================================================
# MODEL 2
# NORMAL vs DISEASE
# =====================================================

def validate_normal_or_disease(image):

    start = time.time()

    print(
        "Running Normal Skin vs Disease..."
    )

    image_array = prepare_image(
        image
    )

    predictions = run_tflite_model(
        normal_disease_model,
        image_array,
    )

    index = int(
        np.argmax(predictions)
    )

    predicted_class = (
        normal_disease_classes[index]
    )

    confidence = (
        float(predictions[index])
        * 100
    )

    result = {
        "class": predicted_class,
        "confidence": round(
            confidence,
            2,
        ),
    }

    print(
        "Normal/Disease result:",
        result,
    )

    return result


# =====================================================
# MODEL 3
# DISEASE CLASSIFICATION
# =====================================================

def predict_disease(image):

    start = time.time()

    print(
        "Running Disease Classification..."
    )

    image_array = prepare_image(
        image
    )

    predictions = run_tflite_model(
        disease_model,
        image_array,
    )

    index = int(
        np.argmax(predictions)
    )

    predicted_class = (
        disease_classes[index]
    )

    confidence = (
        float(predictions[index])
        * 100
    )

    severity_map = {

        "Acne": "Low",

        "Psoriasis": "Medium",

        "Ringworm": "Medium",

        "Vitiligo": "Low",
    }

    severity = severity_map.get(
        predicted_class,
        "Unknown",
    )

    result = {

        "prediction":
            predicted_class,

        "confidence":
            round(
                confidence,
                2,
            ),

        "severity":
            severity,
    }

    print(
        "Disease result:",
        result,
    )

    return result


# =====================================================
# HOME
# =====================================================

@app.get("/")
def home():

    return {
        "message":
            "DermaDetect AI API is running"
    }


# =====================================================
# HEALTH
# =====================================================

@app.api_route(
    "/health",
    methods=["GET", "HEAD"],
)
def health():

    return {

        "status":
            "ok",

        "service":
            "DermaDetect AI Service",
    }


# =====================================================
# VALIDATE
# =====================================================

@app.post("/validate")
async def validate_image(
    data: ImageUrlRequest,
):

    request_start = time.time()

    try:

        print(
            "\n========================================"
        )

        print(
            "========== IMAGE VALIDATION =========="
        )

        print(
            "Image URL:",
            data.imageUrl,
        )

        print(
            "========================================"
        )


        # -----------------------------------------
        # DOWNLOAD
        # -----------------------------------------

        image = download_image(
            data.imageUrl
        )


        # -----------------------------------------
        # MODEL 1
        # -----------------------------------------

        skin_result = validate_skin_type(
            image
        )


        # -----------------------------------------
        # NON-SKIN
        # -----------------------------------------

        if skin_result["class"] == "non_skin":

            total_time = round(
                time.time()
                - request_start,
                2,
            )

            return {

                "status":
                    "invalid_image",

                "message":
                    "Please upload a clear image of the skin area.",

                "confidence":
                    skin_result[
                        "confidence"
                    ],
            }


        # -----------------------------------------
        # MODEL 2
        # -----------------------------------------

        normal_disease_result = (
            validate_normal_or_disease(
                image
            )
        )


        # -----------------------------------------
        # NORMAL SKIN
        # -----------------------------------------

        if (
            normal_disease_result["class"]
            == "normal_skin"
        ):

            total_time = round(
                time.time()
                - request_start,
                2,
            )

            return {

                "status":
                    "normal_skin",

                "message":
                    "Please upload a clear image of the affected skin area.",

                "confidence":
                    normal_disease_result[
                        "confidence"
                    ],
            }


        # -----------------------------------------
        # VALID SKIN
        # -----------------------------------------

        total_time = round(
            time.time()
            - request_start,
            2,
        )

        return {

            "status":
                "valid_skin",

            "message":
                "Skin image accepted.",

            "confidence":
                normal_disease_result[
                    "confidence"
                ],
        }


    except Exception as error:

        print(
            "VALIDATION ERROR:",
            str(error),
        )

        raise HTTPException(
            status_code=500,
            detail=str(error),
        )


# =====================================================
# PREDICT
# =====================================================

@app.post("/predict")
async def predict_url(
    data: ImageUrlRequest,
):

    try:

        print(
            "\n========================================"
        )

        print(
            "========== DISEASE PREDICTION =========="
        )

        print(
            "Image URL:",
            data.imageUrl,
        )

        image = download_image(
            data.imageUrl
        )

        result = predict_disease(
            image
        )

        return result


    except Exception as error:

        print(
            "AI ERROR:",
            str(error),
        )

        raise HTTPException(
            status_code=500,
            detail=str(error),
        )


# =====================================================
# START SERVER
# =====================================================

if __name__ == "__main__":

    import uvicorn

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
    )