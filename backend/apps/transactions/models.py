# backend/apps/transactions/models.py
from django.db import models
import uuid
from apps.invoices.models import Invoice

class BankAccount(models.Model):
    """Model to store bank account information"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    account_name = models.CharField(max_length=100)
    account_number = models.CharField(max_length=50)
    bank_name = models.CharField(max_length=100)
    current_balance = models.DecimalField(max_digits=15, decimal_places=2)
    
    def __str__(self):
        return f"{self.account_name} - {self.bank_name}"


class Transaction(models.Model):
    """Model to store financial transactions"""
    TRANSACTION_TYPES = (
        ('income', 'Recette'),
        ('expense', 'Dépense'),
        ('transfer', 'Virement'),
    )
    
    STATUS_CHOICES = (
        ('pending', 'En attente'),
        ('completed', 'Complété'),
        ('failed', 'Échoué'),
        ('reconciled', 'Rapproché'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    transaction_date = models.DateField()
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    description = models.CharField(max_length=255)
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    bank_account = models.ForeignKey(BankAccount, on_delete=models.CASCADE, related_name='transactions')
    related_invoice = models.ForeignKey(Invoice, on_delete=models.SET_NULL, null=True, blank=True, related_name='transactions')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-transaction_date']
    
    def __str__(self):
        return f"{self.transaction_type} - {self.amount} - {self.transaction_date}"
