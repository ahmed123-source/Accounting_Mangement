# backend/apps/reports/models.py
from django.db import models
from apps.accounts.models import User
import uuid
from apps.invoices.models import Invoice
from apps.transactions.models import Transaction

class Report(models.Model):
    """Model to store generated financial reports"""
    REPORT_TYPES = (
        ('income_statement', 'Compte de résultat'),
        ('balance_sheet', 'Bilan comptable'),
        ('cash_flow', 'Flux de trésorerie'),
        ('tax_report', 'Rapport fiscal'),
        ('custom', 'Rapport personnalisé'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=100)
    report_type = models.CharField(max_length=30, choices=REPORT_TYPES)
    start_date = models.DateField() 
    end_date = models.DateField()
    generated_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports')
    created_at = models.DateTimeField(auto_now_add=True)
    file = models.FileField(upload_to='reports/', null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.start_date} to {self.end_date}"


class Notification(models.Model):
    """Model to store system notifications"""
    PRIORITY_CHOICES = (
        ('low', 'Faible'),
        ('medium', 'Moyenne'),
        ('high', 'Haute'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=100)
    message = models.TextField()
    read = models.BooleanField(default=False)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.user.username}"


class Anomaly(models.Model):
    """Model to store detected financial anomalies"""
    ANOMALY_TYPES = (
        ('duplicate_invoice', 'Facture en double'),
        ('amount_mismatch', 'Montant incohérent'),
        ('missing_data', 'Données manquantes'),
        ('unusual_transaction', 'Transaction inhabituelle'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    anomaly_type = models.CharField(max_length=30, choices=ANOMALY_TYPES)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=(
        ('new', 'Nouveau'),
        ('investigating', 'En cours d\'investigation'),
        ('resolved', 'Résolu'),
        ('false_positive', 'Faux positif'),
    ), default='new')
    related_invoice = models.ForeignKey(Invoice, on_delete=models.SET_NULL, null=True, blank=True, related_name='anomalies')
    related_transaction = models.ForeignKey(Transaction, on_delete=models.SET_NULL, null=True, blank=True, related_name='anomalies')
    detected_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-detected_at']
        verbose_name_plural = 'Anomalies'
    
    def __str__(self):
        return f"{self.anomaly_type} - {self.detected_at}"