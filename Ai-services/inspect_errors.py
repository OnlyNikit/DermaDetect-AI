import tensorflow as tf
import numpy as np
import os
import shutil

# ==============================
# SETTINGS
# ==============================

IMAGE_SIZE = (224, 224)
TEST_DIR = "dataset/final_dataset/test"
MODEL_PATH = "best_model.keras"

OUTPUT_DIR = "misclassified_images"

# ==============================
# LOAD DATASET
# ==============================

dataset = tf.keras.utils.image_dataset_from_directory(
    TEST_DIR,
    image_size=IMAGE_SIZE,
    batch_size=1,
    shuffle=False
)

class_names = dataset.class_names

print("Classes:", class_names)

# ==============================
# LOAD MODEL
# ==============================

model = tf.keras.models.load_model(MODEL_PATH)

# ==============================
# GET ALL IMAGE PATHS
# ==============================

image_paths = []

for class_name in class_names:
    class_folder = os.path.join(TEST_DIR, class_name)

    for filename in sorted(os.listdir(class_folder)):
        image_paths.append(
            os.path.join(class_folder, filename)
        )

# ==============================
# CREATE OUTPUT FOLDER
# ==============================

os.makedirs(OUTPUT_DIR, exist_ok=True)

# ==============================
# CHECK PREDICTIONS
# ==============================

error_count = 0

for index, (images, labels) in enumerate(dataset):

    true_index = labels.numpy()[0]

    prediction = model.predict(
        images,
        verbose=0
    )

    predicted_index = np.argmax(prediction[0])

    # Agar prediction galat hai
    if predicted_index != true_index:

        true_class = class_names[true_index]
        predicted_class = class_names[predicted_index]

        confidence = prediction[0][predicted_index] * 100

        original_path = image_paths[index]

        filename = os.path.basename(original_path)

        new_filename = (
            f"actual_{true_class}"
            f"__predicted_{predicted_class}"
            f"__{confidence:.2f}"
            f"__{filename}"
        )

        destination = os.path.join(
            OUTPUT_DIR,
            new_filename
        )

        shutil.copy(
            original_path,
            destination
        )

        print(
            f"Wrong prediction: "
            f"{true_class} → {predicted_class} "
            f"({confidence:.2f}%)"
        )

        error_count += 1


print("\n==============================")
print(f"Total wrong predictions: {error_count}")
print(f"Images saved in: {OUTPUT_DIR}")
print("==============================")