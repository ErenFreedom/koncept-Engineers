import re

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

    verhoeff_table_inv = (0, 4, 3, 2, 1, 5, 6, 7, 8, 9)

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


# Testing
aadhaar = "770792120014"
pan = "ABCDE1234F"
gst = "22ABCDE1234F1Z5"

print(f"Validating Aadhaar: {aadhaar} ->", "Valid" if validate_aadhaar_checksum(aadhaar) else "Invalid")
print(f"Validating PAN: {pan} ->", "Valid" if validate_pan(pan) else "Invalid")
print(f"Validating GST: {gst} ->", "Valid" if validate_gst(gst) else "Invalid")
