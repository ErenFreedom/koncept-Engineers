from flask import Flask, request, jsonify
from flask_cors import CORS  # Enable CORS
import boto3
import re

app = Flask(__name__)
CORS(app)  # Enable CORS for API Access

# Initialize Textract Client
textract = boto3.client("textract", region_name="us-east-1")


# Aadhaar Validation using Verhoeff Algorithm
def validate_aadhaar_checksum(aadhaar_number):
    verhoeff_table_d = (
        (0, 1, 2, 3, 4, 5, 6, 7, 8, 9),
        (1, 2, 3, 4, 0, 6, 7, 8, 9, 5),
        (2, 3, 4, 0, 1, 7, 8, 9, 5, 6),
        (3, 4, 0, 1, 2, 8, 9, 5, 6, 7),
        (4, 0, 1, 2, 3, 9, 5, 6, 7, 8),
        (5, 9, 8, 7, 6, 0, 4, 3, 2, 1),
        (6, 5, 9, 8, 7, 1, 0, 4, 3, 2),
        (7, 6, 5, 9, 8, 2, 1, 0, 4, 3),
        (8, 7, 6, 5, 9, 3, 2, 1, 0, 4),
        (9, 8, 7, 6, 5, 4, 3, 2, 1, 0)
    )

    verhoeff_table_p = (
        (0, 1, 2, 3, 4, 5, 6, 7, 8, 9),
        (1, 5, 7, 6, 2, 8, 3, 0, 9, 4),
        (5, 8, 0, 3, 7, 9, 6, 1, 4, 2),
        (8, 9, 1, 6, 0, 4, 3, 5, 2, 7),
        (9, 4, 5, 3, 1, 2, 6, 8, 7, 0),
        (4, 2, 8, 6, 5, 7, 3, 9, 0, 1),
        (2, 7, 9, 3, 8, 0, 6, 4, 1, 5),
        (7, 0, 4, 6, 9, 1, 3, 2, 5, 8)
    )

    if not aadhaar_number.isdigit() or len(aadhaar_number) != 12:
        return False

    checksum = 0
    reversed_digits = map(int, reversed(aadhaar_number))

    for i, digit in enumerate(reversed_digits):
        checksum = verhoeff_table_d[checksum][verhoeff_table_p[i % 8][digit]]

    return checksum == 0


# PAN Validation
def validate_pan(pan):
    return bool(re.match(r"^[A-Z]{5}[0-9]{4}[A-Z]$", pan))


# GST Validation
def validate_gst(gst):
    return bool(re.match(r"^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$", gst))


# Extract Text from S3 using AWS Textract
def extract_text_from_s3(bucket, document):
    response = textract.analyze_document(
        Document={"S3Object": {"Bucket": bucket, "Name": document}},
        FeatureTypes=["FORMS"]
    )

    extracted_text = "\n".join(
        block["Text"] for block in response["Blocks"] if block["BlockType"] == "LINE"
    )
    return extracted_text


# API Route: Validate Documents
@app.route('/validate-docs', methods=['POST'])
def validate_documents():
    data = request.json
    bucket = data.get("bucket")
    documents = data.get("documents", [])

    results = []

    for doc in documents:
        extracted_text = extract_text_from_s3(bucket, doc)
        
        # Aadhaar Validation
        if "aadhaar" in doc.lower():
            match = re.search(r"\b\d{4}\s\d{4}\s\d{4}\b", extracted_text)
            if match:
                aadhaar_number = match.group().replace(" ", "")
                is_valid = validate_aadhaar_checksum(aadhaar_number)
                results.append({"Document": doc, "Type": "Aadhaar", "Number": aadhaar_number, "Valid": is_valid})
            else:
                results.append({"Document": doc, "Type": "Aadhaar", "Number": "Not Found", "Valid": False})

        # PAN Validation
        elif "pan" in doc.lower():
            match = re.search(r"\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b", extracted_text)
            is_valid = validate_pan(match.group()) if match else False
            results.append({"Document": doc, "Type": "PAN", "Number": match.group() if match else "Not Found", "Valid": is_valid})

        # GST Validation
        elif "gst" in doc.lower():
            match = re.search(r"\b\d{2}[A-Z]{5}\d{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}\b", extracted_text)
            is_valid = validate_gst(match.group()) if match else False
            results.append({"Document": doc, "Type": "GST", "Number": match.group() if match else "Not Found", "Valid": is_valid})

    return jsonify(results)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
