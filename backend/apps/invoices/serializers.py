# backend/apps/invoices/serializers.py
from rest_framework import serializers
from .models import Invoice, InvoiceItem

class InvoiceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceItem
        fields = ('id', 'description', 'quantity', 'unit_price', 'total_price')


class InvoiceSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True, read_only=True)
    uploaded_by_username = serializers.ReadOnlyField(source='uploaded_by.username')
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Invoice
        fields = ('id', 'invoice_number', 'supplier', 'invoice_date', 'due_date', 
                  'total_amount', 'tax_amount', 'status', 'status_display', 
                  'created_at', 'updated_at', 'uploaded_by', 'uploaded_by_username', 
                  'original_file', 'items')
        read_only_fields = ('id', 'created_at', 'updated_at')
