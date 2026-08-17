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


model = load_model("best_model.keras")


class_names = [
    "Acne",
    "Psoriasis",
    "Ringworm",
    "Vitiligo"
]


# Node backend exactly this field bhejega
class ImageUrlRequest(BaseModel):
    imageUrl: str


def predict_from_image(image):

    image = image.convert("RGB")

    image = image.resize((224, 224))

    image_array = np.array(image)

    image_array = np.expand_dims(
        image_array,
        axis=0
    )

    predictions = model.predict(image_array)

    predicted_index = int(
        np.argmax(predictions[0])
    )

    predicted_class = class_names[predicted_index]

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
        "confidence": round(confidence, 2),
        "severity": severity
    }


@app.get("/")
def home():
    return {
        "message": "DermaDetect AI API is running"
    }


@app.post("/predict")
async def predict_url(data: ImageUrlRequest):

    try:

        print("========== RECEIVED BY AI ==========")
        print("Image URL:", data.imageUrl)

        response = requests.get(
            data.imageUrl,
            timeout=30
        )

        response.raise_for_status()

        image = Image.open(
            io.BytesIO(response.content)
        )

        result = predict_from_image(image)

        print("Prediction:", result)

        return result

    except Exception as error:

        print("AI ERROR:", str(error))

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )