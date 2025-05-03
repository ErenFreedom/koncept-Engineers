import base64
import re
import os
import sys


current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(current_dir, "."))
if project_root not in sys.path:
    sys.path.append(project_root)


from services.qr_service import decode_qr
from digital_signature.aadhaar_secure_qr import decrypt_aadhaar_qr
from digital_signature.aadhaar_verifier import validate_aadhaar_checksum


aadhaar_image_path = "uploads/sample_aadhaar.jpg"

print("\n=== Testing Aadhaar QR ===")


qr_extracted_data = decode_qr(aadhaar_image_path)


print("🔍 Raw QR Extraction Output:", qr_extracted_data)


if not qr_extracted_data or "data" not in qr_extracted_data:
    print("❌ QR code extraction failed.")
    exit()


aadhaar_encoded_data = qr_extracted_data.get("data", "")

print("Extracted QR Data:", aadhaar_encoded_data)  


if aadhaar_encoded_data.isnumeric():
    print("✅ Aadhaar QR is Simple QR - Verifying Directly")

    
    aadhaar_number = aadhaar_encoded_data[:12]

    
    print("🔍 Extracted Aadhaar Number:", aadhaar_number)

    
    if validate_aadhaar_checksum(aadhaar_number):
        print(f"✅ Aadhaar Number is Valid: {aadhaar_number}")
    else:
        print(f"❌ Invalid Aadhaar Number: {aadhaar_number}")


else:
    try:
        
        base64.b64decode(aadhaar_encoded_data, validate=True)
        print("✅ Aadhaar QR is Secure QR - Attempting Decryption")

        
        decryption_result = decrypt_aadhaar_qr(aadhaar_encoded_data)

        if decryption_result["status"] == "Success":
            print("✅ Decoded Aadhaar XML:", decryption_result["xml_data"])
        else:
            print("❌ Aadhaar XML decoding failed:", decryption_result["message"])

    except Exception as e:
        print("❌ Aadhaar QR is not a valid Secure QR -", str(e))
