from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from tensorflow.keras.models import load_model
from PIL import Image
import numpy as np
import io

app = FastAPI()

# Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load trained model
model = load_model("best_model.keras")

# IMPORTANT: Same order as training
class_names = [
    "Acne",
    "Psoriasis",
    "Ringworm",
    "Vitiligo"
]


@app.get("/")
def home():
    return {
        "message": "DermaDetect AI API is raunning"
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)):

    # Read uploaded image
    contents = await file.read()

    # Open image
    image = Image.open(io.BytesIO(contents)).convert("RGB")

    # Resize to same size used during training
    image = image.resize((224, 224))

    # Convert to numpy array
    image_array = np.array(image)

    # Add batch dimension
    image_array = np.expand_dims(image_array, axis=0)

    # Model prediction
    predictions = model.predict(image_array)

    # Get highest probability
    predicted_index = int(np.argmax(predictions[0]))

    predicted_class = class_names[predicted_index]

    confidence = float(predictions[0][predicted_index]) * 100

    def get_severity(disease, confidence):

        severity_map = {
            "Acne": "Low",
            "Psoriasis": "Medium",
            "Ringworm": "Medium",
            "Vitiligo": "Low",
        }

        return severity_map.get(disease, "Unknown")
    severity = get_severity(predicted_class, confidence)



    return {
        "prediction": predicted_class,
        "confidence": round(confidence, 2),
        "severity":severity
    }