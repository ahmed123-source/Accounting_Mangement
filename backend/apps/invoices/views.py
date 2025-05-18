from rest_framework import viewsets, parsers, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Invoice, InvoiceItem
from .serializers import InvoiceSerializer, InvoiceItemSerializer
from django.db import transaction
from rest_framework.exceptions import UnsupportedMediaType
from apps.utils.ocr import process_invoice_ocr
from django.conf import settings
import os
import csv
from django.http import HttpResponse

class InvoiceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for invoice management with OCR capabilities
    """
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]
    
    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)
    
    @action(detail=False, methods=['post'], parser_classes=[parsers.MultiPartParser])
    def upload_with_ocr(self, request):
        """
        Upload an invoice file and process it with OCR
        """
        if 'file' not in request.FILES:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        file = request.FILES['file']
        
        # Save the file temporarily
        file_path = os.path.join(settings.MEDIA_ROOT, 'temp', file.name)
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        with open(file_path, 'wb+') as destination:
            for chunk in file.chunks():
                destination.write(chunk)
        
        try:
            # Process the file with OCR
            ocr_data = process_invoice_ocr(file_path)
            
            # Create the invoice with extracted data
            with transaction.atomic():
                invoice = Invoice.objects.create(
                    invoice_number=ocr_data.get('invoice_number', ''),
                    supplier=ocr_data.get('supplier', ''),
                    invoice_date=ocr_data.get('invoice_date'),
                    due_date=ocr_data.get('due_date'),
                    total_amount=ocr_data.get('total_amount', 0),
                    tax_amount=ocr_data.get('tax_amount', 0),
                    status='pending',
                    uploaded_by=request.user,
                    original_file=file
                )
                
                # Create invoice items
                for item in ocr_data.get('items', []):
                    InvoiceItem.objects.create(
                        invoice=invoice,
                        description=item.get('description', ''),
                        quantity=item.get('quantity', 0),
                        unit_price=item.get('unit_price', 0),
                        total_price=item.get('total_price', 0)
                    )
            
            # Remove temp file
            os.remove(file_path)
            
            return Response(InvoiceSerializer(invoice).data, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            # Clean up temp file if it exists
            if os.path.exists(file_path):
                os.remove(file_path)
            
            return Response({
                'error': 'Failed to process invoice with OCR',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        
    # Ajoutez cette action à InvoiceViewSet
    @action(detail=False, methods=['get'])
    def export(self, request):
        """
        Export invoices as CSV
        """
        queryset = self.filter_queryset(self.get_queryset())
        
        # Create the HttpResponse object with CSV header
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="invoices.csv"'
        
        # Create the CSV writer
        writer = csv.writer(response)
        writer.writerow(['Numéro de facture', 'Fournisseur', 'Date de facture', 
                        'Date d\'échéance', 'Montant total', 'Montant TVA', 'Statut'])
        
        # Write data rows
        for invoice in queryset:
            writer.writerow([
                invoice.invoice_number,
                invoice.supplier,
                invoice.invoice_date,
                invoice.due_date,
                invoice.total_amount,
                invoice.tax_amount,
                invoice.get_status_display()
            ])
        
        return response
