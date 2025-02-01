from flask import Flask, request, jsonify
import os
import sys

# Ensure we can import from 'services'
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from services.ocr_engine import extract_text
from services.extract_data import extract_aadhaar, extract_pan, extract_gst

app = Flask(__name__)
UPLOAD_FOLDER = "uploads/"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route("/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    # Extract text using OCR
    extracted_text = extract_text(filepath)
    print("\n=== Extracted Text ===\n", extracted_text, "\n======================")  # Debugging

    # Extract Aadhaar, PAN, GST
    aadhaar = extract_aadhaar(extracted_text)
    pan = extract_pan(extracted_text)
    gst = extract_gst(extracted_text)

    return jsonify({
        "extracted_text": extracted_text,
        "aadhaar": aadhaar,
        "pan": pan,
        "gst": gst
    })

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
