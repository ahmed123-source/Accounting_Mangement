# backend/apps/reports/serializers.py
from rest_framework import serializers
from .models import Report, Notification, Anomaly

class ReportSerializer(serializers.ModelSerializer):
    generated_by_name = serializers.ReadOnlyField(source='generated_by.get_full_name')
    report_type_display = serializers.CharField(source='get_report_type_display', read_only=True)
    
    class Meta:
        model = Report
        fields = ('id', 'title', 'report_type', 'report_type_display', 'start_date', 
                  'end_date', 'generated_by', 'generated_by_name', 'created_at', 'file')
        read_only_fields = ('id', 'created_at')


class NotificationSerializer(serializers.ModelSerializer):
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    
    class Meta:
        model = Notification
        fields = ('id', 'user', 'title', 'message', 'read', 'priority', 
                  'priority_display', 'created_at')
        read_only_fields = ('id', 'created_at')


class AnomalySerializer(serializers.ModelSerializer):
    anomaly_type_display = serializers.CharField(source='get_anomaly_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    invoice_number = serializers.ReadOnlyField(source='related_invoice.invoice_number')
    transaction_description = serializers.ReadOnlyField(source='related_transaction.description')
    
    class Meta:
        model = Anomaly
        fields = ('id', 'anomaly_type', 'anomaly_type_display', 'description', 'status', 
                  'status_display', 'related_invoice', 'invoice_number', 
                  'related_transaction', 'transaction_description', 'detected_at', 'resolved_at')
        read_only_fields = ('id', 'detected_at')