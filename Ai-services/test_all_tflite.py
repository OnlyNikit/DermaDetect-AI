import tensorflow as tf
import numpy as np
from PIL import Image


# =====================================================
# LABELS
# =====================================================

skin_classes = [
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
# LOAD MODEL
# =====================================================

def load_tflite_model(model_path):

    print("\n========================================")
    print("Loading:", model_path)
    print("========================================")

    interpreter = tf.lite.Interpreter(
        model_path=model_path
    )

    interpreter.allocate_tensors()

    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()

    return (
        interpreter,
        input_details,
        output_details,
    )


# =====================================================
# PREPARE IMAGE
# =====================================================

def prepare_image(image_path):

    image = Image.open(
        image_path
    ).convert("RGB")

    image = image.resize(
        (224, 224)
    )

    image_array = np.array(
        image,
        dtype=np.float32
    )

    image_array = np.expand_dims(
        image_array,
        axis=0
    )

    return image_array


# =====================================================
# PREDICT
# =====================================================

def predict(
    interpreter,
    input_details,
    output_details,
    image_array
):

    input_index = input_details[0]["index"]
    output_index = output_details[0]["index"]

    interpreter.set_tensor(
        input_index,
        image_array
    )

    interpreter.invoke()

    output = interpreter.get_tensor(
        output_index
    )

    return output[0]


# =====================================================
# IMAGE
# =====================================================

image_path = "test.jpg"

image_array = prepare_image(
    image_path
)


# =====================================================
# MODEL 1
# SKIN VALIDATOR
# =====================================================

interpreter, input_details, output_details = (
    load_tflite_model(
        "skin_validator.tflite"
    )
)

prediction = predict(
    interpreter,
    input_details,
    output_details,
    image_array
)

index = int(
    np.argmax(prediction)
)

confidence = (
    float(prediction[index]) * 100
)

print("\nMODEL 1 RESULT")
print(
    "Class:",
    skin_classes[index]
)

print(
    "Confidence:",
    round(confidence, 2),
    "%"
)


# =====================================================
# STOP IF NON-SKIN
# =====================================================

if skin_classes[index] == "non_skin":

    print(
        "\nFINAL RESULT:"
    )

    print(
        "❌ INVALID IMAGE"
    )

    print(
        "Please upload a clear image of the skin area."
    )

    exit()


# =====================================================
# MODEL 2
# NORMAL vs DISEASE
# =====================================================

interpreter, input_details, output_details = (
    load_tflite_model(
        "normal_disease_model.tflite"
    )
)

prediction = predict(
    interpreter,
    input_details,
    output_details,
    image_array
)

index = int(
    np.argmax(prediction)
)

confidence = (
    float(prediction[index]) * 100
)

print("\nMODEL 2 RESULT")

print(
    "Class:",
    normal_disease_classes[index]
)

print(
    "Confidence:",
    round(confidence, 2),
    "%"
)


# =====================================================
# STOP IF NORMAL
# =====================================================

if normal_disease_classes[index] == "normal_skin":

    print(
        "\nFINAL RESULT:"
    )

    print(
        "❌ NORMAL SKIN"
    )

    print(
        "Please upload a clear image of the affected skin area."
    )

    exit()


# =====================================================
# MODEL 3
# DISEASE CLASSIFICATION
# =====================================================

interpreter, input_details, output_details = (
    load_tflite_model(
        "best_model.tflite"
    )
)

prediction = predict(
    interpreter,
    input_details,
    output_details,
    image_array
)

index = int(
    np.argmax(prediction)
)

confidence = (
    float(prediction[index]) * 100
)

print("\nMODEL 3 RESULT")

print(
    "Disease:",
    disease_classes[index]
)

print(
    "Confidence:",
    round(confidence, 2),
    "%"
)


# =====================================================
# FINAL
# =====================================================

print(
    "\n========================================"
)

print(
    "✅ VALID SKIN IMAGE"
)

print(
    "Disease:",
    disease_classes[index]
)

print(
    "Confidence:",
    round(confidence, 2),
    "%"
)

print(
    "========================================"
)