# backend/apps/reports/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Report, Notification, Anomaly
from .serializers import ReportSerializer, NotificationSerializer, AnomalySerializer
import pandas as pd
import matplotlib.pyplot as plt
import io
from django.http import FileResponse
from apps.transactions.models import Transaction
from apps.invoices.models import Invoice
from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth


class ReportViewSet(viewsets.ModelViewSet):
    """
    ViewSet for report generation and management
    """
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['report_type', 'start_date', 'end_date', 'generated_by']
    
    def perform_create(self, serializer):
        serializer.save(generated_by=self.request.user)
    
    @action(detail=False, methods=['post'])
    def generate_income_statement(self, request):
        """
        Generate an income statement report
        """
        start_date = request.data.get('start_date')
        end_date = request.data.get('end_date')
        
        if not start_date or not end_date:
            return Response({'error': 'Start date and end date are required'}, status=400)
        
        try:
            # Get all transactions within date range
            income = Transaction.objects.filter(
                transaction_date__range=[start_date, end_date],
                transaction_type='income'
            ).aggregate(total=Sum('amount'))
            
            expenses = Transaction.objects.filter(
                transaction_date__range=[start_date, end_date],
                transaction_type='expense'
            ).aggregate(total=Sum('amount'))
            
            # Calculate profit/loss
            total_income = income['total'] or 0
            total_expenses = expenses['total'] or 0
            net_profit = total_income - total_expenses
            
            # Create a report entry
            report = Report.objects.create(
                title=f"Income Statement: {start_date} to {end_date}",
                report_type='income_statement',
                start_date=start_date,
                end_date=end_date,
                generated_by=request.user,
            )
            
            # Generate and save report file
            # (In a real implementation, use a proper reporting library)
            data = {
                'Income': [total_income],
                'Expenses': [total_expenses],
                'Net Profit/Loss': [net_profit]
            }
            df = pd.DataFrame(data)
            
            # Save as CSV file
            report_file = io.StringIO()
            df.to_csv(report_file, index=False)
            report_file.seek(0)
            
            # Return report data
            return Response({
                'report': ReportSerializer(report).data,
                'data': {
                    'total_income': total_income,
                    'total_expenses': total_expenses,
                    'net_profit': net_profit
                }
            })
        
        except Exception as e:
            return Response({'error': str(e)}, status=400)


class NotificationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for notification management
    """
    serializer_class = NotificationSerializer
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        self.get_queryset().update(read=True)
        return Response({'status': 'All notifications marked as read'})


class AnomalyViewSet(viewsets.ModelViewSet):
    """
    ViewSet for anomaly detection and management
    """
    queryset = Anomaly.objects.all()
    serializer_class = AnomalySerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['anomaly_type', 'status', 'related_invoice', 'related_transaction']
    
    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        """
        Mark an anomaly as resolved
        """
        try:
            anomaly = self.get_object()
            anomaly.status = 'resolved'
            anomaly.save()
            return Response({
                'status': 'Anomaly resolved',
                'anomaly': AnomalySerializer(anomaly).data
            })
        except Exception as e:
            return Response({'error': str(e)}, status=400)
    
    @action(detail=True, methods=['post'])
    def mark_false_positive(self, request, pk=None):
        """
        Mark an anomaly as a false positive
        """
        try:
            anomaly = self.get_object()
            anomaly.status = 'false_positive'
            anomaly.save()
            return Response({
                'status': 'Anomaly marked as false positive',
                'anomaly': AnomalySerializer(anomaly).data
            })
        except Exception as e:
            return Response({'error': str(e)}, status=400)