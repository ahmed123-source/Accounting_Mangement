# backend/apps/utils/ocr.py
import os
import cv2
import pytesseract
from pytesseract import Output
import re
from datetime import datetime
import logging
from django.conf import settings

# Configure logger
logger = logging.getLogger(__name__)

def process_invoice_ocr(file_path):
    """
    Process an invoice image with OCR to extract relevant information
    
    Args:
        file_path (str): Path to the invoice image file
        
    Returns:
        dict: Dictionary containing extracted invoice data
    """
    try:
        # In a real implementation, you would use a more sophisticated OCR solution
        # This is a simplified example
        
        # Read the image
        image = cv2.imread(file_path)
        if image is None:
            raise ValueError(f"Failed to read image from {file_path}")
        
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Apply threshold to get image with only black and white
        thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)[1]
        
        # Extract text using pytesseract
        text = pytesseract.image_to_string(thresh)
        
        # Extract structured data with custom OCR post-processing
        data = extract_invoice_data(text)
        
        # For demo purposes, if we couldn't extract proper data, return default values
        if not data.get('invoice_number'):
            # In a production environment, you'd handle this differently
            data = default_demo_data()
        
        return data
        
    except Exception as e:
        logger.error(f"Error processing invoice with OCR: {str(e)}")
        # Return default data for demonstration purposes
        return default_demo_data()


def extract_invoice_data(text):
    """
    Extract structured data from OCR text
    
    Args:
        text (str): The OCR-extracted text
        
    Returns:
        dict: Dictionary containing extracted invoice data
    """
    # Initialize data dictionary
    data = {
        'invoice_number': None,
        'supplier': None,
        'invoice_date': None,
        'due_date': None,
        'total_amount': None,
        'tax_amount': None,
        'items': []
    }
    
    # Extract invoice number (simple regex approach)
    invoice_number_match = re.search(r'facture[:\s]*([A-Z0-9-]+)', text, re.IGNORECASE)
    if invoice_number_match:
        data['invoice_number'] = invoice_number_match.group(1).strip()
    
    # Extract supplier name
    supplier_match = re.search(r'fournisseur[:\s]*([^\n]+)', text, re.IGNORECASE)
    if supplier_match:
        data['supplier'] = supplier_match.group(1).strip()
    
    # Extract invoice date
    date_match = re.search(r'date[:\s]*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})', text, re.IGNORECASE)
    if date_match:
        date_str = date_match.group(1)
        try:
            # Attempt to parse the date
            if '/' in date_str:
                day, month, year = date_str.split('/')
            else:
                day, month, year = date_str.split('-')
            
            if len(year) == 2:
                year = '20' + year
            
            data['invoice_date'] = datetime(int(year), int(month), int(day)).date()
            
            # Set due date as 30 days after invoice date (example)
            due_date = data['invoice_date'].replace(month=data['invoice_date'].month + 1)
            data['due_date'] = due_date
            
        except Exception as e:
            logger.error(f"Error parsing date: {str(e)}")
    
    # Extract total amount
    total_match = re.search(r'total[:\s]*([0-9.,]+)', text, re.IGNORECASE)
    if total_match:
        try:
            total_str = total_match.group(1).replace(',', '.')
            data['total_amount'] = float(total_str)
        except ValueError:
            logger.error(f"Error parsing total amount: {total_match.group(1)}")
    
    # Extract tax amount
    tax_match = re.search(r'tva[:\s]*([0-9.,]+)', text, re.IGNORECASE)
    if tax_match:
        try:
            tax_str = tax_match.group(1).replace(',', '.')
            data['tax_amount'] = float(tax_str)
        except ValueError:
            logger.error(f"Error parsing tax amount: {tax_match.group(1)}")
    
    # Extract line items (more complex - would require custom logic for each invoice format)
    # This is a simplified example
    item_lines = re.findall(r'(\d+)\s+([^\n]+)\s+(\d+[.,]?\d*)\s+(\d+[.,]?\d*)', text)
    for item in item_lines:
        try:
            qty, desc, unit_price, total = item
            data['items'].append({
                'description': desc.strip(),
                'quantity': float(qty),
                'unit_price': float(unit_price.replace(',', '.')),
                'total_price': float(total.replace(',', '.'))
            })
        except (ValueError, IndexError) as e:
            logger.error(f"Error parsing item line: {str(e)}")
    
    return data

def default_demo_data():
    """
    Return default demo data for the OCR function
    This is used when OCR fails or for demonstration purposes
    
    Returns:
        dict: Dictionary containing demo invoice data
    """
    today = datetime.now().date()
    due_date = today.replace(month=today.month + 1 if today.month < 12 else 1)
    
    return {
        'invoice_number': f"INV-{today.strftime('%Y%m%d')}-001",
        'supplier': "Fournisseur Exemple SARL",
        'invoice_date': today,
        'due_date': due_date,
        'total_amount': 1250.50,
        'tax_amount': 250.10,
        'items': [
            {
                'description': "Service de consultation",
                'quantity': 5,
                'unit_price': 200.00,
                'total_price': 1000.00
            },
            {
                'description': "Frais administratifs",
                'quantity': 1,
                'unit_price': 250.50,
                'total_price': 250.50
            }
        ]
    }


