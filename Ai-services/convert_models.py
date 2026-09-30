import tensorflow as tf
import os
import time


MODELS = [
    ("skin_validator.keras", "skin_validator.tflite"),
    ("normal_disease_model.keras", "normal_disease_model.tflite"),
    ("best_model.keras", "best_model.tflite"),
]


print("========================================")
print("       TFLITE MODEL CONVERSION")
print("========================================")


for keras_file, tflite_file in MODELS:

    print("\n----------------------------------------")
    print("Converting:", keras_file)
    print("----------------------------------------")

    start = time.time()

    if not os.path.exists(keras_file):
        print("ERROR: File not found:", keras_file)
        continue

    try:

        print("Loading model...")

        model = tf.keras.models.load_model(
            keras_file
        )

        print("Model loaded.")

        print("Converting to TFLite...")

        converter = tf.lite.TFLiteConverter.from_keras_model(
            model
        )

        # First conversion: FLOAT32
        converter.optimizations = []

        tflite_model = converter.convert()

        with open(
            tflite_file,
            "wb"
        ) as f:
            f.write(tflite_model)

        size_mb = (
            os.path.getsize(tflite_file)
            / (1024 * 1024)
        )

        print(
            "SUCCESS:",
            tflite_file
        )

        print(
            "Size:",
            round(size_mb, 2),
            "MB"
        )

        print(
            "Time:",
            round(time.time() - start, 2),
            "seconds"
        )

        # Free model memory
        del model
        del converter
        del tflite_model

    except Exception as error:

        print(
            "ERROR converting",
            keras_file
        )

        print(
            str(error)
        )


print("\n========================================")
print("          CONVERSION COMPLETE")
print("========================================")