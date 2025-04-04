# backend/apps/utils/anomaly_detection.py
import numpy as np
from django.db.models import Avg, StdDev
from apps.transactions.models import Transaction
from apps.invoices.models import Invoice
from apps.reports.models import Anomaly

def detect_duplicate_invoices(invoice):
    """
    Detect duplicate invoices based on invoice number and similar amount
    
    Args:
        invoice (Invoice): The invoice to check
        
    Returns:
        bool: True if a duplicate is detected, False otherwise
    """
    potential_duplicates = Invoice.objects.filter(
        invoice_number=invoice.invoice_number,
        supplier=invoice.supplier
    ).exclude(id=invoice.id)
    
    if potential_duplicates.exists():
        # Create an anomaly record
        Anomaly.objects.create(
            anomaly_type='duplicate_invoice',
            description=f"Potential duplicate invoice: {invoice.invoice_number} from {invoice.supplier}",
            related_invoice=invoice,
            status='new'
        )
        return True
    
    # Also check for similar amounts within a 5% range
    similar_amount_min = invoice.total_amount * 0.95
    similar_amount_max = invoice.total_amount * 1.05
    
    similar_invoices = Invoice.objects.filter(
        supplier=invoice.supplier,
        total_amount__gte=similar_amount_min,
        total_amount__lte=similar_amount_max
    ).exclude(id=invoice.id)
    
    if similar_invoices.exists():
        # Create an anomaly record
        Anomaly.objects.create(
            anomaly_type='duplicate_invoice',
            description=f"Invoice with similar amount ({invoice.total_amount}) from {invoice.supplier}",
            related_invoice=invoice,
            status='new'
        )
        return True
    
    return False


def detect_unusual_transactions(transaction):
    """
    Detect unusual transactions based on historical data
    
    Args:
        transaction (Transaction): The transaction to check
        
    Returns:
        bool: True if anomaly is detected, False otherwise
    """
    # Get average and standard deviation for this transaction type
    stats = Transaction.objects.filter(
        transaction_type=transaction.transaction_type
    ).aggregate(
        avg_amount=Avg('amount'),
        std_amount=StdDev('amount')
    )
    
    if not stats['avg_amount'] or not stats['std_amount']:
        return False
    
    # Calculate Z-score
    z_score = abs(transaction.amount - stats['avg_amount']) / stats['std_amount']
    
    # If z-score is greater than 3, it's considered unusual (99.7% of normal distribution)
    if z_score > 3:
        Anomaly.objects.create(
            anomaly_type='unusual_transaction',
            description=f"Unusual {transaction.transaction_type} amount of {transaction.amount}. " +
                       f"Z-score: {z_score:.2f}",
            related_transaction=transaction,
            status='new'
        )
        return True
    
    return False