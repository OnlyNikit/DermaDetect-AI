import tensorflow as tf
from pathlib import Path

DATASET_DIR = Path("dataset/final_dataset")

IMG_SIZE = (224, 224)
BATCH_SIZE = 16

train_dir = DATASET_DIR / "train"
val_dir = DATASET_DIR / "validation"
test_dir = DATASET_DIR / "test"

train_dataset = tf.keras.utils.image_dataset_from_directory(
    train_dir,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=True,
    seed=42
)

val_dataset = tf.keras.utils.image_dataset_from_directory(
    val_dir,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=False
)

test_dataset = tf.keras.utils.image_dataset_from_directory(
    test_dir,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=False
)

print("\n========== DATASET INFO ==========")

print("Classes:", train_dataset.class_names)
print("Image size:", IMG_SIZE)
print("Batch size:", BATCH_SIZE)

print("\nTrain batches:", tf.data.experimental.cardinality(train_dataset).numpy())
print("Validation batches:", tf.data.experimental.cardinality(val_dataset).numpy())
print("Test batches:", tf.data.experimental.cardinality(test_dataset).numpy())

print("\nDataset loaded successfully.")