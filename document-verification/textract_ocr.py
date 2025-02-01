import boto3
import re

# Initialize Textract Client
textract = boto3.client("textract", region_name="us-east-1")

# Aadhaar Validation using Verhoeff
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


# Regex for PAN Validation
def validate_pan(pan):
    return bool(re.match(r"^[A-Z]{5}[0-9]{4}[A-Z]$", pan))


# Regex for GST Validation
def validate_gst(gst):
    return bool(re.match(r"^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$", gst))


# Extract Text from S3
def extract_text_from_s3(bucket, document):
    response = textract.analyze_document(
        Document={"S3Object": {"Bucket": bucket, "Name": document}},
        FeatureTypes=["FORMS"]
    )

    extracted_text = "\n".join(
        block["Text"] for block in response["Blocks"] if block["BlockType"] == "LINE"
    )
    return extracted_text


# Clean Text
def clean_text(text):
    text = re.sub(r"[^a-zA-Z0-9\s]", "", text)  # Remove special characters
    text = re.sub(r"\s+", " ", text).strip()  # Remove extra spaces
    return text


# Unified Validator
def validate_documents(bucket, documents):
    results = []

    for doc in documents:
        print(f"\n=== Processing {doc} ===")
        extracted_text = extract_text_from_s3(bucket, doc)
        cleaned_text = clean_text(extracted_text)

        # Aadhaar Validation
        if "aadhaar" in doc.lower():
            aadhaar = re.search(r"\b\d{4}\s\d{4}\s\d{4}\b", cleaned_text)
            if aadhaar:
                aadhaar_number = aadhaar.group().replace(" ", "")
                is_valid = validate_aadhaar_checksum(aadhaar_number)
                results.append({"Document": doc, "Type": "Aadhaar", "Number": aadhaar_number, "Valid": is_valid})
            else:
                results.append({"Document": doc, "Type": "Aadhaar", "Number": "Not Found", "Valid": False})

        # PAN Validation
        elif "pan" in doc.lower():
            pan = re.search(r"\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b", cleaned_text)
            if pan:
                is_valid = validate_pan(pan.group())
                results.append({"Document": doc, "Type": "PAN", "Number": pan.group(), "Valid": is_valid})
            else:
                results.append({"Document": doc, "Type": "PAN", "Number": "Not Found", "Valid": False})

        # GST Validation
        elif "gst" in doc.lower():
            gst = re.search(r"\b\d{2}[A-Z]{5}\d{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}\b", cleaned_text)
            if gst:
                is_valid = validate_gst(gst.group())
                results.append({"Document": doc, "Type": "GST", "Number": gst.group(), "Valid": is_valid})
            else:
                results.append({"Document": doc, "Type": "GST", "Number": "Not Found", "Valid": False})

    return results


# Run Validation
s3_bucket = "koncept-engineers-bucket"
documents = ["sample_aadhaar.jpg", "sample_pancard.jpg", "sample_gstcard.jpg"]
validation_results = validate_documents(s3_bucket, documents)

for result in validation_results:
    print(result)
