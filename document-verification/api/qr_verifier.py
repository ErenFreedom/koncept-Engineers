from services.qr_service import decode_qr

def verify_aadhaar_qr(image_path):
    """Verify Aadhaar QR code."""
    qr_data = decode_qr(image_path)
    
    if "No QR code found." in qr_data:
        return {"status": "Failed", "reason": "No QR code detected."}
    
    
    for data in qr_data:
        if "Aadhaar" in data or "UIDAI" in data:
            return {"status": "Success", "details": data}
    
    return {"status": "Failed", "reason": "Invalid Aadhaar QR code."}

def verify_pan_qr(image_path):
    """Verify PAN QR code."""
    qr_data = decode_qr(image_path)
    
    if "No QR code found." in qr_data:
        return {"status": "Failed", "reason": "No QR code detected."}
    
    
    for data in qr_data:
        if "Permanent Account Number" in data or "Income Tax Department" in data:
            return {"status": "Success", "details": data}
    
    return {"status": "Failed", "reason": "Invalid PAN QR code."}

def verify_gst_qr(image_path):
    """Verify GST QR code."""
    qr_data = decode_qr(image_path)
    
    if "No QR code found." in qr_data:
        return {"status": "Failed", "reason": "No QR code detected."}
    
    
    for data in qr_data:
        if "GSTIN" in data or "Goods and Services Tax" in data:
            return {"status": "Success", "details": data}
    
    return {"status": "Failed", "reason": "Invalid GST QR code."}
