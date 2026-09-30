from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from tensorflow.keras.models import load_model
from PIL import Image
from pydantic import BaseModel

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
# LOAD MODELS
# =====================================================

print("========== LOADING MODELS ==========")

model_start = time.time()


# =====================================================
# MODEL 1
# NON-SKIN vs NORMAL SKIN
# =====================================================

skin_validator_model = load_model(
    "skin_validator.keras"
)

print(
    "Skin Validator loaded:",
    round(time.time() - model_start, 2),
    "seconds",
)


# =====================================================
# MODEL 2
# NORMAL SKIN vs DISEASE
# =====================================================

normal_disease_model = load_model(
    "normal_disease_model.keras"
)

print(
    "Normal/Disease model loaded:",
    round(time.time() - model_start, 2),
    "seconds",
)


# =====================================================
# MODEL 3
# DISEASE CLASSIFICATION
# =====================================================

disease_model = load_model(
    "best_model.keras"
)

print(
    "Disease model loaded:",
    round(time.time() - model_start, 2),
    "seconds",
)


print(
    "ALL MODELS LOADED IN:",
    round(time.time() - model_start, 2),
    "seconds",
)


# =====================================================
# LABELS
# =====================================================

# Model 1
skin_validator_classes = [
    "non_skin",
    "normal_skin",
]


# Model 2
normal_disease_classes = [
    "disease",
    "normal_skin",
]


# Model 3
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

    print("Downloading image...")

    response = requests.get(
        image_url,
        timeout=30,
    )

    response.raise_for_status()

    print(
        "Image downloaded in:",
        round(time.time() - start, 2),
        "seconds",
    )

    print(
        "Image size:",
        len(response.content),
        "bytes",
    )

    image = Image.open(
        io.BytesIO(response.content)
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

    image = image.convert("RGB")

    image = image.resize(
        (224, 224)
    )

    image_array = np.array(
        image
    )

    image_array = np.expand_dims(
        image_array,
        axis=0,
    )

    return image_array


# =====================================================
# MODEL 1
# NON-SKIN vs NORMAL SKIN
# =====================================================

def validate_skin_type(image):

    start = time.time()

    print(
        "Running Skin Validator..."
    )

    image_array = prepare_image(
        image
    )

    predictions = skin_validator_model.predict(
        image_array,
        verbose=0,
    )

    predicted_index = int(
        np.argmax(predictions[0])
    )

    predicted_class = (
        skin_validator_classes[
            predicted_index
        ]
    )

    confidence = (
        float(
            predictions[0][predicted_index]
        )
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
# NORMAL SKIN vs DISEASE
# =====================================================

def validate_normal_or_disease(image):

    start = time.time()

    print(
        "Running Normal Skin vs Disease..."
    )

    image_array = prepare_image(
        image
    )

    predictions = normal_disease_model.predict(
        image_array,
        verbose=0,
    )

    predicted_index = int(
        np.argmax(predictions[0])
    )

    predicted_class = (
        normal_disease_classes[
            predicted_index
        ]
    )

    confidence = (
        float(
            predictions[0][predicted_index]
        )
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

    print(
        "Normal/Disease model time:",
        round(
            time.time() - start,
            2,
        ),
        "seconds",
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

    predictions = disease_model.predict(
        image_array,
        verbose=0,
    )

    predicted_index = int(
        np.argmax(predictions[0])
    )

    predicted_class = (
        disease_classes[
            predicted_index
        ]
    )

    confidence = (
        float(
            predictions[0][predicted_index]
        )
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
        "prediction": predicted_class,
        "confidence": round(
            confidence,
            2,
        ),
        "severity": severity,
    }

    print(
        "Disease result:",
        result,
    )

    print(
        "Disease model time:",
        round(
            time.time() - start,
            2,
        ),
        "seconds",
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
        "status": "ok",
        "service":
            "DermaDetect AI Service",
    }


# =====================================================
# VALIDATE IMAGE
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


        # =================================================
        # DOWNLOAD IMAGE
        # =================================================

        image = download_image(
            data.imageUrl
        )

        print(
            "Download completed."
        )


        # =================================================
        # STEP 1
        # NON-SKIN vs NORMAL SKIN
        # =================================================

        skin_result = validate_skin_type(
            image
        )


        # =================================================
        # NON-SKIN IMAGE
        # =================================================

        if skin_result["class"] == "non_skin":

            total_time = round(
                time.time() - request_start,
                2,
            )

            print(
                "Non-skin image detected."
            )

            print(
                "Validation finished in:",
                total_time,
                "seconds",
            )

            return {
                "status":
                    "invalid_image",

                "message":
                    "Please upload a clear image of the skin area.",

                "confidence":
                    skin_result["confidence"],
            }


        # =================================================
        # STEP 2
        # NORMAL SKIN vs DISEASE
        # =================================================

        print(
            "Image passed Skin Validator."
        )

        normal_disease_result = (
            validate_normal_or_disease(
                image
            )
        )


        # =================================================
        # NORMAL SKIN
        # =================================================

        if (
            normal_disease_result["class"]
            == "normal_skin"
        ):

            total_time = round(
                time.time() - request_start,
                2,
            )

            print(
                "Normal skin detected."
            )

            print(
                "Validation finished in:",
                total_time,
                "seconds",
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


        # =================================================
        # VALID DISEASE-LIKE SKIN
        # =================================================

        total_time = round(
            time.time() - request_start,
            2,
        )

        print(
            "Potentially affected skin image accepted."
        )

        print(
            "Validation finished in:",
            total_time,
            "seconds",
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

        total_time = round(
            time.time() - request_start,
            2,
        )

        print(
            "VALIDATION ERROR:",
            str(error),
        )

        print(
            "Failed after:",
            total_time,
            "seconds",
        )

        raise HTTPException(
            status_code=500,
            detail=str(error),
        )


# =====================================================
# DISEASE PREDICTION
# =====================================================

@app.post("/predict")
async def predict_url(
    data: ImageUrlRequest,
):

    request_start = time.time()

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

        print(
            "========================================"
        )


        # =================================================
        # DOWNLOAD IMAGE
        # =================================================

        image = download_image(
            data.imageUrl
        )


        # =================================================
        # FINAL DISEASE PREDICTION
        # =================================================

        result = predict_disease(
            image
        )


        total_time = round(
            time.time() - request_start,
            2,
        )

        print(
            "Prediction finished in:",
            total_time,
            "seconds",
        )

        return result


    except Exception as error:

        total_time = round(
            time.time() - request_start,
            2,
        )

        print(
            "AI ERROR:",
            str(error),
        )

        print(
            "Failed after:",
            total_time,
            "seconds",
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