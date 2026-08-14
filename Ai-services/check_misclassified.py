import tensorflow as tf
import numpy as np
import os
import shutil

# ==============================
# SETTINGS
# ==============================

MODEL_PATH = "best_model.keras"
TEST_DIR = "dataset/final_dataset/test"
OUTPUT_DIR = "misclassified_images"

IMG_SIZE = (224, 224)
BATCH_SIZE = 16

# ==============================
# LOAD MODEL
# ==============================

model = tf.keras.models.load_model(MODEL_PATH)

print("Model loaded successfully.")

# ==============================
# LOAD TEST DATASET
# shuffle=False is IMPORTANT
# ==============================

test_dataset = tf.keras.utils.image_dataset_from_directory(
    TEST_DIR,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=False
)

class_names = test_dataset.class_names

print("\nClasses:", class_names)

# ==============================
# GET FILE PATHS
# ==============================

file_paths = []

for class_name in class_names:
    class_path = os.path.join(TEST_DIR, class_name)

    for file_name in sorted(os.listdir(class_path)):
        file_path = os.path.join(class_path, file_name)

        if os.path.isfile(file_path):
            file_paths.append(file_path)

print("Total images:", len(file_paths))

# ==============================
# PREDICT
# ==============================

y_true = []
y_pred = []
confidences = []

for images, labels in test_dataset:

    predictions = model.predict(images, verbose=0)

    predicted_classes = np.argmax(predictions, axis=1)
    prediction_confidence = np.max(predictions, axis=1)

    y_true.extend(labels.numpy())
    y_pred.extend(predicted_classes)
    confidences.extend(prediction_confidence)

# ==============================
# CREATE OUTPUT FOLDER
# ==============================

if os.path.exists(OUTPUT_DIR):
    shutil.rmtree(OUTPUT_DIR)

os.makedirs(OUTPUT_DIR)

# ==============================
# SAVE WRONG PREDICTIONS
# ==============================

wrong_count = 0

for i in range(len(y_true)):

    true_class = class_names[y_true[i]]
    predicted_class = class_names[y_pred[i]]

    if y_true[i] != y_pred[i]:

        wrong_count += 1

        confidence = confidences[i] * 100

        print(
            f"Wrong prediction: "
            f"{true_class} → {predicted_class} "
            f"({confidence:.2f}%)"
        )

        # Create folder based on mistake
        mistake_folder = f"{true_class}_TO_{predicted_class}"

        save_folder = os.path.join(
            OUTPUT_DIR,
            mistake_folder
        )

        os.makedirs(save_folder, exist_ok=True)

        original_file = file_paths[i]

        # Copy wrong image
        shutil.copy(
            original_file,
            save_folder
        )

print("\n==============================")
print(f"Total wrong predictions: {wrong_count}")
print(f"Images saved in: {OUTPUT_DIR}")
print("==============================")