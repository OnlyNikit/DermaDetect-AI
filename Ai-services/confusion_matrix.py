import tensorflow as tf
import numpy as np
from sklearn.metrics import confusion_matrix, classification_report

# ==============================
# SETTINGS
# ==============================

IMAGE_SIZE = (224, 224)
BATCH_SIZE = 16

TEST_DIR = "dataset/final_dataset/test"
MODEL_PATH = "best_model.keras"


# ==============================
# LOAD TEST DATASET
# ==============================

test_dataset = tf.keras.utils.image_dataset_from_directory(
    TEST_DIR,
    image_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=False
)

class_names = test_dataset.class_names

print("\nClasses:", class_names)


# ==============================
# LOAD MODEL
# ==============================

model = tf.keras.models.load_model(MODEL_PATH)


# ==============================
# GET ACTUAL LABELS
# ==============================

y_true = np.concatenate([
    labels.numpy()
    for images, labels in test_dataset
])


# ==============================
# GET MODEL PREDICTIONS
# ==============================

predictions = model.predict(test_dataset)

y_pred = np.argmax(predictions, axis=1)


# ==============================
# CONFUSION MATRIX
# ==============================

cm = confusion_matrix(y_true, y_pred)

print("\n========== CONFUSION MATRIX ==========\n")
print(cm)


# ==============================
# CLASSIFICATION REPORT
# ==============================

print("\n========== CLASSIFICATION REPORT ==========\n")

print(
    classification_report(
        y_true,
        y_pred,
        target_names=class_names
    )
)