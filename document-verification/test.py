import base64
import re
import os
import sys

# Dynamically add the project root to sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(current_dir, "."))
if project_root not in sys.path:
    sys.path.append(project_root)

# Import modules
from services.qr_service import decode_qr
from digital_signature.aadhaar_secure_qr import decrypt_aadhaar_qr
from digital_signature.aadhaar_verifier import validate_aadhaar_checksum

# Aadhaar Image Path
aadhaar_image_path = "uploads/sample_aadhaar.jpg"

print("\n=== Testing Aadhaar QR ===")

# Extract QR code data
qr_extracted_data = decode_qr(aadhaar_image_path)

# Debugging: Print raw QR extraction output
print("🔍 Raw QR Extraction Output:", qr_extracted_data)

# Handle failed QR extraction
if not qr_extracted_data or "data" not in qr_extracted_data:
    print("❌ QR code extraction failed.")
    exit()

# Extract actual QR data
aadhaar_encoded_data = qr_extracted_data.get("data", "")

print("Extracted QR Data:", aadhaar_encoded_data)  # ✅ Print extracted QR data

# 🔹 Step 1: Check if the extracted QR data is numeric (Simple QR)
if aadhaar_encoded_data.isnumeric():
    print("✅ Aadhaar QR is Simple QR - Verifying Directly")

    # Extract Aadhaar UID (12-digit number)
    aadhaar_number = aadhaar_encoded_data[:12]

    # Debugging: Show extracted Aadhaar number
    print("🔍 Extracted Aadhaar Number:", aadhaar_number)

    # Validate Aadhaar number using checksum
    if validate_aadhaar_checksum(aadhaar_number):
        print(f"✅ Aadhaar Number is Valid: {aadhaar_number}")
    else:
        print(f"❌ Invalid Aadhaar Number: {aadhaar_number}")

# 🔹 Step 2: Check if it's Base64 encoded (Secure QR)
else:
    try:
        # Debugging: Check if the data is Base64 encoded
        base64.b64decode(aadhaar_encoded_data, validate=True)
        print("✅ Aadhaar QR is Secure QR - Attempting Decryption")

        # 🔹 Step 3: Attempt Decryption
        decryption_result = decrypt_aadhaar_qr(aadhaar_encoded_data)

        if decryption_result["status"] == "Success":
            print("✅ Decoded Aadhaar XML:", decryption_result["xml_data"])
        else:
            print("❌ Aadhaar XML decoding failed:", decryption_result["message"])

    except Exception as e:
        print("❌ Aadhaar QR is not a valid Secure QR -", str(e))
