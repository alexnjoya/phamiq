import onnxruntime
import numpy as np
import cv2
import albumentations as A
from albumentations.pytorch import ToTensorV2
import matplotlib.pyplot as plt
from google.colab import files
import os

# Define class mappings
class_dict = {
    'c1': "cashew_anthracnose",
    'c2': "cashew_gummosis",
    'c3': "cashew_healthy",
    'c4': "cashew_leafminer",
    'c5': "cashew_redrust",
    'ca1': "cassava_bacterial_blight",
    'ca2': "cassava_brown_spot",
    'ca3': "cassava_green_mite",
    'ca4': "cassava_healthy",
    'ca5': "cassava_mosaic",
    'm1': "maize_fall_armyworm",
    'm2': "maize_grasshopper",
    'm3': "maize_healthy",
    'm4': "maize_leaf_beetle",
    'm5': "maize_leaf_blight",
    'm6': "maize_leaf_spot",
    'm7': "maize_streak_virus",
    't1': "tomato_healthy",
    't2': "tomato_leaf_blight",
    't3': "tomato_leaf_curl",
    't4': "tomato_leaf_spot",
    't5': "tomato_verticillium_wilt"
}
idx_to_class = {i: j for i, j in enumerate(class_dict.values())}

# EXACTLY match training transforms from notebook
train_transforms = A.Compose([
    A.ShiftScaleRotate(shift_limit=0.05, scale_limit=0.05, rotate_limit=360, p=0.5),
    A.Normalize(mean=(0.485, 0.456, 0.406), std=(0.229, 0.224, 0.225)),
    ToTensorV2(),
])

# Load model with your specified path
model_path = '/content/effv2_pq (1).onnx'
ort_session = onnxruntime.InferenceSession(model_path)

def preprocess_image(image):
    """Match EXACT training preprocessing"""
    # Convert to RGB
    if len(image.shape) == 2:
        image = cv2.cvtColor(image, cv2.COLOR_GRAY2RGB)
    else:
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    
    # Resize to training size (112x112)
    image = cv2.resize(image, (112, 112))
    
    # Apply transforms
    transformed = train_transforms(image=image)
    return transformed["image"].unsqueeze(0).numpy()

def predict(image_path):
    image = cv2.imread(image_path)
    input_data = preprocess_image(image)
    
    ort_inputs = {ort_session.get_inputs()[0].name: input_data}
    ort_outs = ort_session.run(None, ort_inputs)
    
    outputs = ort_outs[0]
    probs = np.exp(outputs) / np.sum(np.exp(outputs), axis=1, keepdims=True)
    probs = probs[0]
    
    top3_idx = np.argsort(probs)[-3:][::-1]
    return [(idx_to_class[i], probs[i]) for i in top3_idx]

def test_image(image_path):
    image = cv2.imread(image_path)
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    
    predictions = predict(image_path)
    
    plt.figure(figsize=(12, 6))
    plt.subplot(1, 2, 1)
    plt.imshow(image_rgb)
    plt.title("Original Image")
    plt.axis('off')
    
    plt.subplot(1, 2, 2)
    classes = [p[0] for p in predictions]
    confidences = [p[1] for p in predictions]
    colors = plt.cm.viridis(np.linspace(0, 1, len(classes)))
    plt.barh(range(len(classes)), confidences, color=colors)
    plt.yticks(range(len(classes)), classes)
    plt.xlabel("Confidence")
    plt.title("Top Predictions")
    plt.xlim(0, 1)
    
    plt.tight_layout()
    plt.show()
    
    print("Detailed predictions:")
    for i, (cls, conf) in enumerate(predictions, 1):
        print(f"{i}. {cls}: {conf:.2%}")

# Upload and test
print("Upload an image to test...")
uploaded = files.upload()
image_path = next(iter(uploaded))
test_image(image_path)
