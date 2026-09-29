import os
import numpy as np
import tensorflow as tf

from sklearn.metrics import (
    classification_report,
    confusion_matrix
)

# =========================
# CONFIG
# =========================

DATASET_DIR = "dataset/normal_disease"
MODEL_PATH = "normal_disease_model.keras"

IMG_SIZE = (224, 224)
BATCH_SIZE = 16


# =========================
# LOAD TEST DATA
# =========================

test_ds = tf.keras.utils.image_dataset_from_directory(
    os.path.join(DATASET_DIR, "test"),
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=False
)

class_names = test_ds.class_names

print("\nClasses:")
print(class_names)


# =========================
# LOAD MODEL
# =========================

print("\nLoading model...")

model = tf.keras.models.load_model(
    MODEL_PATH
)


# =========================
# PREDICTIONS
# =========================

print("\nRunning predictions...")

y_true = []
y_pred = []

for images, labels in test_ds:

    predictions = model.predict(
        images,
        verbose=0
    )

    predicted_classes = np.argmax(
        predictions,
        axis=1
    )

    y_true.extend(
        labels.numpy()
    )

    y_pred.extend(
        predicted_classes
    )


y_true = np.array(y_true)
y_pred = np.array(y_pred)


# =========================
# CLASSIFICATION REPORT
# =========================

print("\n================================")
print("CLASSIFICATION REPORT")
print("================================\n")

print(
    classification_report(
        y_true,
        y_pred,
        target_names=class_names,
        digits=4
    )
)


# =========================
# CONFUSION MATRIX
# =========================

cm = confusion_matrix(
    y_true,
    y_pred
)

print("\n================================")
print("CONFUSION MATRIX")
print("================================\n")

print(cm)


# =========================
# SIMPLE INTERPRETATION
# =========================

print("\n================================")
print("CLASS-WISE RESULTS")
print("================================")

for i, class_name in enumerate(class_names):

    total = cm[i].sum()
    correct = cm[i, i]

    accuracy = (
        correct / total
        if total > 0
        else 0
    )

    print(
        f"{class_name}: "
        f"{correct}/{total} "
        f"({accuracy * 100:.2f}%)"
    )


# =========================
# FALSE ACCEPT / REJECT
# =========================

print("\n================================")
print("IMPORTANT ERRORS")
print("================================")

for actual_index, actual_name in enumerate(class_names):

    for predicted_index, predicted_name in enumerate(class_names):

        if actual_index != predicted_index:

            count = cm[
                actual_index,
                predicted_index
            ]

            if count > 0:

                print(
                    f"Actual {actual_name} "
                    f"→ Predicted {predicted_name}: "
                    f"{count}"
                )