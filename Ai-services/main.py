# from fastapi import FastAPI, UploadFile, File, Form
# import json

# app = FastAPI(
#     title="DermaDetect AI",
#     version="1.0.0"
# )


# @app.get("/")
# def home():
#     return {
#         "success": True,
#         "message": "DermaDetect AI service is running"
#     }


# @app.post("/predict")
# async def predict(
#     image: UploadFile = File(...),
#     location: str = Form(...),
#     duration: str = Form(...),
#     itching: str = Form(...),
#     painBurning: str = Form(...),
#     changeSpread: str = Form(...),
#     changeDetails: str = Form("[]"),
#     optionalDetails: str = Form("{}")
# ):
#     try:
#         # -----------------------------------------
#         # Image read
#         # -----------------------------------------
#         image_bytes = await image.read()

#         # -----------------------------------------
#         # JSON strings ko Python objects me convert
#         # -----------------------------------------
#         change_details = json.loads(changeDetails)
#         optional_details = json.loads(optionalDetails)

#         print("\n========== AI REQUEST ==========")

#         print("Image:", image.filename)
#         print("Image size:", len(image_bytes), "bytes")

#         print("Location:", location)
#         print("Duration:", duration)
#         print("Itching:", itching)
#         print("Pain/Burning:", painBurning)
#         print("Change/Spread:", changeSpread)

#         print("Change Details:", change_details)
#         print("Optional Details:", optional_details)

#         print("================================\n")

#         # -----------------------------------------
#         # TEMPORARY RESPONSE
#         # Actual ML model yahan connect hoga
#         # -----------------------------------------
#         prediction = {
#             "disease": "Ringworm",
#             "confidence": 0.966,
#             "severity": "High"
#         }

#         return {
#             "success": True,
#             "prediction": prediction
#         }

#     except Exception as error:

#         print("Prediction error:", error)

#         return {
#             "success": False,
#             "message": str(error)
#         }