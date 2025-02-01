import re

def extract_aadhaar(text):
    """ Extract Aadhaar Number """
    pattern = r"\b\d{4}\s\d{4}\s\d{4}\b"
    match = re.search(pattern, text)
    return match.group(0) if match else "Aadhaar Not Found"

def extract_pan(text):
    """ Extract PAN Number """
    pattern = r"\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b"
    match = re.search(pattern, text)
    return match.group(0) if match else "PAN Not Found"

def extract_pan_name(text):
    """ Extract Name from PAN Card (Assuming it appears in the first 3 lines) """
    lines = text.split(" ")
    return " ".join(lines[:3]) if len(lines) > 2 else "Name Not Found"

def extract_pan_dob(text):
    """ Extract DOB from PAN Card (Format: DD/MM/YYYY) """
    pattern = r"\b\d{2}/\d{2}/\d{4}\b"
    match = re.search(pattern, text)
    return match.group(0) if match else "DOB Not Found"

def extract_gst(text):
    """ Extract GST Number """
    pattern = r"\b\d{2}[A-Z]{5}\d{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}\b"
    match = re.search(pattern, text)
    return match.group(0) if match else "GST Not Found"

# Example Test
if __name__ == "__main__":
    sample_text = """
    Income Tax Department PAN Card
    Name: Rajesh Kumar
    PAN: ABCDE1234F
    DOB: 12/02/1990
    GST: 22ABCDE1234F1Z5
    """

    print("Aadhaar:", extract_aadhaar(sample_text))
    print("PAN:", extract_pan(sample_text))
    print("PAN Name:", extract_pan_name(sample_text))
    print("PAN DOB:", extract_pan_dob(sample_text))
    print("GST:", extract_gst(sample_text))
