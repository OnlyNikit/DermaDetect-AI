import tensorflow as tf

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
# EVALUATE MODEL
# ==============================

loss, accuracy = model.evaluate(
    test_dataset,
    verbose=1
)

print("\n========== TEST RESULTS ==========")
print(f"Test Accuracy: {accuracy * 100:.2f}%")
print(f"Test Loss: {loss:.4f}")
print("==================================")