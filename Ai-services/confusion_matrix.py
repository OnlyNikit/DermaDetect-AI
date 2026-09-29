import tensorflow as tf
import numpy as np

from sklearn.metrics import (
    confusion_matrix,
    classification_report
)

# ============================================================
# CONFIG
# ============================================================

IMAGE_SIZE = (224, 224)
BATCH_SIZE = 16

TEST_DIR = "dataset/final_dataset/test"
MODEL_PATH = "best_model.keras"

# ============================================================
# LOAD TEST DATASET
# ============================================================

print("\n==============================================")
print("       DERMADETECT MODEL EVALUATION")
print("==============================================")

test_dataset = tf.keras.utils.image_dataset_from_directory(
    TEST_DIR,
    image_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=False
)

class_names = test_dataset.class_names

print("\nClasses:")

for i, name in enumerate(class_names):
    print(f"{i}: {name}")

# ============================================================
# LOAD MODEL
# ============================================================

print("\nLoading model...")

model = tf.keras.models.load_model(MODEL_PATH)

print("Model loaded successfully.")

# ============================================================
# GET TRUE LABELS
# ============================================================

y_true = np.concatenate([
    labels.numpy()
    for images, labels in test_dataset
])

# ============================================================
# PREDICTIONS
# ============================================================

print("\nGenerating predictions...")

predictions = model.predict(
    test_dataset,
    verbose=1
)

y_pred = np.argmax(
    predictions,
    axis=1
)

# ============================================================
# CONFUSION MATRIX
# ============================================================

cm = confusion_matrix(
    y_true,
    y_pred
)

print("\n==============================================")
print("             CONFUSION MATRIX")
print("==============================================")

print("\nRows = Actual")
print("Columns = Predicted\n")

print("              ", end="")

for name in class_names:
    print(f"{name[:10]:>12}", end="")

print()

for i, row in enumerate(cm):

    print(f"{class_names[i][:10]:>12}", end="")

    for value in row:
        print(f"{value:>12}", end="")

    print()

# ============================================================
# CLASSIFICATION REPORT
# ============================================================

print("\n==============================================")
print("          CLASSIFICATION REPORT")
print("==============================================\n")

report = classification_report(
    y_true,
    y_pred,
    target_names=class_names,
    digits=4
)

print(report)

# ============================================================
# PER CLASS ACCURACY
# ============================================================

print("==============================================")
print("          PER-CLASS ACCURACY")
print("==============================================\n")

for i, class_name in enumerate(class_names):

    total = np.sum(cm[i])

    correct = cm[i][i]

    accuracy = (
        correct / total
        if total > 0
        else 0
    )

    print(
        f"{class_name:<12}: "
        f"{correct}/{total} "
        f"({accuracy * 100:.2f}%)"
    )

# ============================================================
# WRONG PREDICTION COUNT
# ============================================================

wrong = np.sum(y_true != y_pred)
total = len(y_true)

print("\n==============================================")
print("             FINAL SUMMARY")
print("==============================================")

print(f"Total test images : {total}")
print(f"Correct           : {total - wrong}")
print(f"Wrong             : {wrong}")

print(
    f"Accuracy          : "
    f"{((total - wrong) / total) * 100:.2f}%"
)

print("==============================================")