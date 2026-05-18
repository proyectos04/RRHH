from django.contrib import admin
from .models import CarnetEmitido, CarnetTemplate


@admin.register(CarnetEmitido)
class CarnetEmitidoAdmin(admin.ModelAdmin):
    list_display = ('employee', 'id', 'fecha_emision', 'motivo', 'activo')
    search_fields = ('employee__cedulaidentidad', 'employee__nombres', 'employee__apellidos', 'security_hash')
    list_filter = ('activo', 'motivo', 'fecha_emision')
    readonly_fields = ('security_hash', 'fecha_emision')


@admin.register(CarnetTemplate)
class CarnetTemplateAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'activo', 'creado')
    list_editable = ('activo',)
