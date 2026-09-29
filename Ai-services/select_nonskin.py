import json
import os
import shutil
import random

# ============================================================
# SETTINGS
# ============================================================

BASE_DIR = "dataset/validation_dataset/non_skin"

ANNOTATION_FILE = os.path.join(
    BASE_DIR,
    "annotations",
    "instances_val2017.json"
)

IMAGE_DIR = os.path.join(
    BASE_DIR,
    "val2017"
)

OUTPUT_DIR = os.path.join(
    BASE_DIR,
    "selected"
)

NUMBER_OF_IMAGES = 1000

SEED = 42

random.seed(SEED)


# ============================================================
# CHECK PATHS
# ============================================================

if not os.path.exists(ANNOTATION_FILE):
    raise FileNotFoundError(
        f"Annotation file not found:\n{ANNOTATION_FILE}"
    )

if not os.path.exists(IMAGE_DIR):
    raise FileNotFoundError(
        f"Image directory not found:\n{IMAGE_DIR}"
    )


# ============================================================
# LOAD COCO ANNOTATIONS
# ============================================================

print("\nLoading COCO annotations...")

with open(
    ANNOTATION_FILE,
    "r",
    encoding="utf-8"
) as file:

    coco = json.load(file)


images = coco["images"]
annotations = coco["annotations"]
categories = coco["categories"]


# ============================================================
# FIND PERSON CATEGORY ID
# ============================================================

person_category_id = None

for category in categories:

    if category["name"].lower() == "person":

        person_category_id = category["id"]

        break


if person_category_id is None:

    raise RuntimeError(
        "Person category was not found in COCO annotations."
    )


print(
    f"Person category ID: {person_category_id}"
)


# ============================================================
# FIND IMAGES CONTAINING PERSON
# ============================================================

images_with_person = set()

for annotation in annotations:

    if annotation["category_id"] == person_category_id:

        images_with_person.add(
            annotation["image_id"]
        )


print(
    f"Images containing person: "
    f"{len(images_with_person)}"
)


# ============================================================
# FIND CANDIDATE NON-SKIN IMAGES
# ============================================================

candidate_images = []

for image in images:

    image_id = image["id"]

    filename = image["file_name"]

    # Skip images containing person
    if image_id in images_with_person:
        continue

    image_path = os.path.join(
        IMAGE_DIR,
        filename
    )

    if os.path.isfile(image_path):

        candidate_images.append(
            image
        )


print(
    f"Candidate non-skin images: "
    f"{len(candidate_images)}"
)


# ============================================================
# CHECK ENOUGH IMAGES
# ============================================================

if len(candidate_images) < NUMBER_OF_IMAGES:

    raise RuntimeError(
        f"Only {len(candidate_images)} suitable images found. "
        f"Requested {NUMBER_OF_IMAGES}."
    )


# ============================================================
# RANDOM SELECTION
# ============================================================

selected_images = random.sample(
    candidate_images,
    NUMBER_OF_IMAGES
)


# ============================================================
# CREATE OUTPUT DIRECTORY
# ============================================================

os.makedirs(
    OUTPUT_DIR,
    exist_ok=True
)


# ============================================================
# COPY IMAGES
# ============================================================

copied = 0

print("\nCopying images...\n")

for image in selected_images:

    filename = image["file_name"]

    source = os.path.join(
        IMAGE_DIR,
        filename
    )

    destination = os.path.join(
        OUTPUT_DIR,
        filename
    )

    shutil.copy2(
        source,
        destination
    )

    copied += 1

    if copied % 100 == 0:

        print(
            f"Copied: {copied}/{NUMBER_OF_IMAGES}"
        )


# ============================================================
# FINAL RESULT
# ============================================================

print("\n======================================")
print("NON-SKIN DATASET PREPARATION COMPLETE")
print("======================================")

print(
    f"Selected images : {copied}"
)

print(
    f"Output directory:"
)

print(
    OUTPUT_DIR
)

print("\nDone.")