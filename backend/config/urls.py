"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# Import views
from apps.accounts.views import UserViewSet
from apps.invoices.views import InvoiceViewSet
from apps.transactions.views import BankAccountViewSet, TransactionViewSet
from apps.reports.views import ReportViewSet, NotificationViewSet, AnomalyViewSet

# Create router
router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'invoices', InvoiceViewSet)
router.register(r'bank-accounts', BankAccountViewSet)
router.register(r'transactions', TransactionViewSet)
router.register(r'reports', ReportViewSet)
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'anomalies', AnomalyViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)