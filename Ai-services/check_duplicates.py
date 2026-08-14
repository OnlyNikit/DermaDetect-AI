import random
import re
import shutil
from pathlib import Path

SOURCE_DIR = Path("final_dataset")

TRAIN_DIR = SOURCE_DIR / "train"
VAL_DIR = SOURCE_DIR / "validation"
TEST_DIR = SOURCE_DIR / "test"

TRAIN_RATIO = 0.70
VAL_RATIO = 0.15

SEED = 42

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png"}

random.seed(SEED)


def get_group_id(filename):
    """
    Try to identify the original image ID so augmented
    versions stay in the same dataset split.
    """

    name = Path(filename).stem

    # Remove common augmentation prefixes
    name = re.sub(
        r"^(Crop-[^A-Za-z0-9]*|flip-\d*|saturation-\d*|hue-\d*|Resize-\d*|padd-[^A-Za-z0-9]*)",
        "",
        name,
        flags=re.IGNORECASE
    )

    # Extract numeric IDs from filename
    numbers = re.findall(r"\d+", name)

    if numbers:
        return numbers[-1]

    # If no usable numeric ID exists,
    # keep the complete filename as its own group
    return name


# Find original class folders only
classes = [
    folder
    for folder in SOURCE_DIR.iterdir()
    if folder.is_dir()
    and folder.name not in {"train", "validation", "test"}
]

print("\nClasses found:")
for cls in classes:
    print("-", cls.name)


for cls in classes:

    groups = {}

    images = [
        file
        for file in cls.iterdir()
        if file.is_file()
        and file.suffix.lower() in IMAGE_EXTENSIONS
    ]

    # Group related images
    for image in images:
        group_id = get_group_id(image.name)
        groups.setdefault(group_id, []).append(image)

    group_list = list(groups.values())
    random.shuffle(group_list)

    total_groups = len(group_list)

    train_group_count = int(total_groups * TRAIN_RATIO)
    val_group_count = int(total_groups * VAL_RATIO)

    train_groups = group_list[:train_group_count]

    val_groups = group_list[
        train_group_count:
        train_group_count + val_group_count
    ]

    test_groups = group_list[
        train_group_count + val_group_count:
    ]

    # Create output folders
    for base_dir in [TRAIN_DIR, VAL_DIR, TEST_DIR]:
        (base_dir / cls.name).mkdir(
            parents=True,
            exist_ok=True
        )

    # Copy grouped images
    for group in train_groups:
        for image in group:
            shutil.copy2(
                image,
                TRAIN_DIR / cls.name / image.name
            )

    for group in val_groups:
        for image in group:
            shutil.copy2(
                image,
                VAL_DIR / cls.name / image.name
            )

    for group in test_groups:
        for image in group:
            shutil.copy2(
                image,
                TEST_DIR / cls.name / image.name
            )

    print(f"\n{cls.name}")
    print(f"Total images: {len(images)}")
    print(f"Total groups: {total_groups}")
    print(
        f"Train: {sum(len(g) for g in train_groups)} images"
    )
    print(
        f"Validation: {sum(len(g) for g in val_groups)} images"
    )
    print(
        f"Test: {sum(len(g) for g in test_groups)} images"
    )

print("\nLeakage-aware dataset split completed.")