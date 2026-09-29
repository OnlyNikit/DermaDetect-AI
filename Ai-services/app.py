from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from tensorflow.keras.models import load_model
from PIL import Image
from pydantic import BaseModel

import numpy as np
import io
import requests


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =====================================================
# LOAD MODELS
# =====================================================

disease_model = load_model("best_model.keras")

skin_validator = load_model(
    "skin_validator.keras"
)

normal_disease_model = load_model(
    "normal_disease_model.keras"
)


# =====================================================
# LABELS
# =====================================================

disease_classes = [
    "Acne",
    "Psoriasis",
    "Ringworm",
    "Vitiligo"
]

skin_classes = [
    "non_skin",
    "normal_skin"
]

normal_disease_classes = [
    "disease",
    "normal_skin"
]


# =====================================================
# REQUEST MODEL
# =====================================================

class ImageUrlRequest(BaseModel):
    imageUrl: str


# =====================================================
# LOAD IMAGE FROM URL
# =====================================================

def download_image(image_url):

    response = requests.get(
        image_url,
        timeout=30
    )

    response.raise_for_status()

    return Image.open(
        io.BytesIO(response.content)
    )


# =====================================================
# PREPARE IMAGE
# =====================================================

def prepare_image(image):

    image = image.convert("RGB")

    image = image.resize(
        (224, 224)
    )

    image_array = np.array(image)

    image_array = np.expand_dims(
        image_array,
        axis=0
    )

    return image_array


# =====================================================
# STAGE 1
# SKIN vs NON-SKIN
# =====================================================

def validate_skin(image):

    image_array = prepare_image(image)

    predictions = skin_validator.predict(
        image_array,
        verbose=0
    )

    predicted_index = int(
        np.argmax(predictions[0])
    )

    predicted_class = skin_classes[
        predicted_index
    ]

    confidence = float(
        predictions[0][predicted_index]
    ) * 100

    return {
        "class": predicted_class,
        "confidence": round(
            confidence,
            2
        )
    }


# =====================================================
# STAGE 2
# NORMAL SKIN vs DISEASE
# =====================================================

def validate_normal_or_disease(image):

    image_array = prepare_image(image)

    predictions = normal_disease_model.predict(
        image_array,
        verbose=0
    )

    predicted_index = int(
        np.argmax(predictions[0])
    )

    predicted_class = normal_disease_classes[
        predicted_index
    ]

    confidence = float(
        predictions[0][predicted_index]
    ) * 100

    return {
        "class": predicted_class,
        "confidence": round(
            confidence,
            2
        )
    }


# =====================================================
# STAGE 3
# DISEASE CLASSIFICATION
# =====================================================

def predict_disease(image):

    image_array = prepare_image(image)

    predictions = disease_model.predict(
        image_array,
        verbose=0
    )

    predicted_index = int(
        np.argmax(predictions[0])
    )

    predicted_class = disease_classes[
        predicted_index
    ]

    confidence = float(
        predictions[0][predicted_index]
    ) * 100

    severity_map = {
        "Acne": "Low",
        "Psoriasis": "Medium",
        "Ringworm": "Medium",
        "Vitiligo": "Low",
    }

    severity = severity_map.get(
        predicted_class,
        "Unknown"
    )

    return {
        "prediction": predicted_class,
        "confidence": round(
            confidence,
            2
        ),
        "severity": severity
    }


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
    methods=["GET", "HEAD"]
)
def health():

    return {
        "status": "ok",
        "service":
        "DermaDetect AI Service"
    }


# =====================================================
# VALIDATE IMAGE
# =====================================================

@app.post("/validate")
async def validate_image(
    data: ImageUrlRequest
):

    try:

        print(
            "\n========== IMAGE VALIDATION =========="
        )

        print(
            "Image URL:",
            data.imageUrl
        )

        image = download_image(
            data.imageUrl
        )

        # -----------------------------------------
        # STAGE 1
        # -----------------------------------------

        skin_result = validate_skin(
            image
        )

        print(
            "Skin validation:",
            skin_result
        )

        if skin_result["class"] == "non_skin":

            return {
                "status": "invalid_image",

                "message":
                    "Please upload a clear skin image.",

                "confidence":
                    skin_result["confidence"]
            }

        # -----------------------------------------
        # STAGE 2
        # -----------------------------------------

        normal_result = validate_normal_or_disease(
            image
        )

        print(
            "Normal/Disease:",
            normal_result
        )

        if (
            normal_result["class"]
            == "normal_skin"
        ):

            return {
                "status": "normal_skin",

                "message":
                    "No apparent skin disease detected.",

                "confidence":
                    normal_result["confidence"]
            }

        # -----------------------------------------
        # VALID DISEASE IMAGE
        # -----------------------------------------

        return {
            "status": "valid_skin",

            "message":
                "Skin image accepted.",

            "confidence":
                normal_result["confidence"]
        }

    except Exception as error:

        print(
            "VALIDATION ERROR:",
            str(error)
        )

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


# =====================================================
# DISEASE PREDICTION
# =====================================================

@app.post("/predict")
async def predict_url(
    data: ImageUrlRequest
):

    try:

        print(
            "\n========== DISEASE PREDICTION =========="
        )

        print(
            "Image URL:",
            data.imageUrl
        )

        image = download_image(
            data.imageUrl
        )

        result = predict_disease(
            image
        )

        print(
            "Disease prediction:",
            result
        )

        return result

    except Exception as error:

        print(
            "AI ERROR:",
            str(error)
        )

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )

# =====================================================
# START SERVER
# =====================================================

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000
    )