# backend/apps/transactions/serializers.py
from rest_framework import serializers
from .models import BankAccount, Transaction

class BankAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = BankAccount
        fields = ('id', 'account_name', 'account_number', 'bank_name', 'current_balance')
        read_only_fields = ('id',)


class TransactionSerializer(serializers.ModelSerializer):
    bank_account_name = serializers.ReadOnlyField(source='bank_account.account_name')
    transaction_type_display = serializers.CharField(source='get_transaction_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    invoice_number = serializers.ReadOnlyField(source='related_invoice.invoice_number')
    
    class Meta:
        model = Transaction
        fields = ('id', 'transaction_date', 'amount', 'description', 'transaction_type', 
                  'transaction_type_display', 'status', 'status_display', 'bank_account', 
                  'bank_account_name', 'related_invoice', 'invoice_number', 
                  'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')