from django.db import models
from apps.accounts.models import User
import uuid

class Invoice(models.Model):
    """Model to store invoice data extracted via OCR"""
    STATUS_CHOICES = (
        ('pending', 'En attente'),
        ('processing', 'En traitement'),
        ('validated', 'Validé'),
        ('error', 'Erreur'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice_number = models.CharField(max_length=50, unique=True)
    supplier = models.CharField(max_length=100)
    invoice_date = models.DateField()
    due_date = models.DateField()
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='invoices')
    original_file = models.FileField(upload_to='invoices/')
    
    class Meta:
        ordering = ['-invoice_date']
        
    def __str__(self):
        return f"Invoice {self.invoice_number} - {self.supplier}"


class InvoiceItem(models.Model):
    """Model to store individual line items from invoices"""
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='items')
    description = models.CharField(max_length=255)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    
    def __str__(self):
        return f"{self.description} - {self.invoice.invoice_number}"