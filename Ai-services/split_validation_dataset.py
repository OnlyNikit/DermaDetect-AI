import os
import shutil
import random

SOURCE = "dataset/validation_dataset"
DEST = "dataset/validation_split"

CLASSES = ["normal_skin", "non_skin"]

TRAIN_RATIO = 0.70
VAL_RATIO = 0.15
TEST_RATIO = 0.15

SEED = 42

random.seed(SEED)


def split_class(class_name):
    source_dir = os.path.join(SOURCE, class_name)

    # non_skin ke actual images selected folder me hain
    if class_name == "non_skin":
        source_dir = os.path.join(source_dir, "selected")

    if not os.path.exists(source_dir):
        print(f"❌ Not found: {source_dir}")
        return

    images = [
        f for f in os.listdir(source_dir)
        if f.lower().endswith((".jpg", ".jpeg", ".png", ".webp"))
    ]

    random.shuffle(images)

    total = len(images)

    train_end = int(total * TRAIN_RATIO)
    val_end = train_end + int(total * VAL_RATIO)

    train_images = images[:train_end]
    val_images = images[train_end:val_end]
    test_images = images[val_end:]

    print(f"\n{class_name}")
    print(f"Total: {total}")
    print(f"Train: {len(train_images)}")
    print(f"Val:   {len(val_images)}")
    print(f"Test:  {len(test_images)}")

    for split_name, split_images in [
        ("train", train_images),
        ("val", val_images),
        ("test", test_images),
    ]:
        dest_dir = os.path.join(DEST, split_name, class_name)
        os.makedirs(dest_dir, exist_ok=True)

        for image_name in split_images:
            src = os.path.join(source_dir, image_name)
            dst = os.path.join(dest_dir, image_name)

            shutil.copy2(src, dst)


for class_name in CLASSES:
    split_class(class_name)

print("\n✅ Validation dataset split complete.")