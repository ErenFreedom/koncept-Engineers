import cv2
import numpy as np
from PIL import Image
import pytesseract
import re

def preprocess_image(image_path):
    """ Preprocess image to improve OCR accuracy """
    image = cv2.imread(image_path)

    
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    
    thresh = cv2.adaptiveThreshold(
        gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 31, 2
    )

    
    blur = cv2.GaussianBlur(thresh, (3, 3), 0)

    return Image.fromarray(blur)

def clean_text(text):
    """ Clean extracted OCR text """
    text = text.replace("\n", " ")  
    text = re.sub(r"[^a-zA-Z0-9\s\.:]", "", text)  
    text = re.sub(r"\s+", " ", text).strip()  
    return text

def extract_text(image_path):
    """ Extract text from image using Tesseract OCR """
    processed_image = preprocess_image(image_path)
    custom_config = r'--oem 3 --psm 6 -l eng+hin'  
    raw_text = pytesseract.image_to_string(processed_image, config=custom_config)

    cleaned_text = clean_text(raw_text)
    
    return cleaned_text
