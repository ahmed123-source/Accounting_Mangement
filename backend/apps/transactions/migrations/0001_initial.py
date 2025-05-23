# Generated by Django 5.1.7 on 2025-04-01 21:28

import django.db.models.deletion
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('invoices', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='BankAccount',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('account_name', models.CharField(max_length=100)),
                ('account_number', models.CharField(max_length=50)),
                ('bank_name', models.CharField(max_length=100)),
                ('current_balance', models.DecimalField(decimal_places=2, max_digits=15)),
            ],
        ),
        migrations.CreateModel(
            name='Transaction',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('transaction_date', models.DateField()),
                ('amount', models.DecimalField(decimal_places=2, max_digits=15)),
                ('description', models.CharField(max_length=255)),
                ('transaction_type', models.CharField(choices=[('income', 'Recette'), ('expense', 'Dépense'), ('transfer', 'Virement')], max_length=20)),
                ('status', models.CharField(choices=[('pending', 'En attente'), ('completed', 'Complété'), ('failed', 'Échoué'), ('reconciled', 'Rapproché')], default='pending', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('bank_account', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='transactions', to='transactions.bankaccount')),
                ('related_invoice', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='transactions', to='invoices.invoice')),
            ],
            options={
                'ordering': ['-transaction_date'],
            },
        ),
    ]
