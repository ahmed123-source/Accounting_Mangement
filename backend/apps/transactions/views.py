# backend/apps/transactions/views.py
from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import BankAccount, Transaction
from .serializers import BankAccountSerializer, TransactionSerializer
from apps.invoices.models import Invoice

class BankAccountViewSet(viewsets.ModelViewSet):
    """
    ViewSet for bank account management
    """
    queryset = BankAccount.objects.all()
    serializer_class = BankAccountSerializer


class TransactionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for transaction management
    """
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['transaction_type', 'status', 'bank_account', 'transaction_date']
    search_fields = ['description']
    ordering_fields = ['transaction_date', 'amount']
    
    @action(detail=False, methods=['post'])
    def reconcile_with_invoice(self, request):
        """
        Link a transaction with an invoice for reconciliation
        """
        transaction_id = request.data.get('transaction_id')
        invoice_id = request.data.get('invoice_id')
        
        if not transaction_id or not invoice_id:
            return Response({'error': 'Both transaction_id and invoice_id are required'}, 
                           status=400)
        
        try:
            transaction = Transaction.objects.get(id=transaction_id)
            invoice = Invoice.objects.get(id=invoice_id)
            
            # Check if amounts match
            if transaction.amount != invoice.total_amount:
                return Response({
                    'warning': 'Transaction amount and invoice amount do not match',
                    'transaction_amount': transaction.amount,
                    'invoice_amount': invoice.total_amount
                }, status=200)
            
            transaction.related_invoice = invoice
            transaction.status = 'reconciled'
            transaction.save()
            
            return Response({
                'message': 'Transaction reconciled with invoice successfully',
                'transaction': TransactionSerializer(transaction).data
            })
        
        except Transaction.DoesNotExist:
            return Response({'error': 'Transaction not found'}, status=404)
        except Invoice.DoesNotExist:
            return Response({'error': 'Invoice not found'}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=400)