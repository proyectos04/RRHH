from rest_framework import serializers
from RAC.models import Employee, AsigTrabajo, Denominacioncargo, DireccionGeneral
from .models import CarnetEmitido, CarnetTemplate


class EmployeeCarnetSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    cedula = serializers.CharField(source='cedulaidentidad')
    nombres = serializers.CharField()
    apellidos = serializers.CharField()
    nombre_completo = serializers.SerializerMethodField()
    cargo = serializers.SerializerMethodField()
    departamento = serializers.SerializerMethodField()
    codigo = serializers.SerializerMethodField()
    correo = serializers.EmailField()
    telefono = serializers.SerializerMethodField()
    profile = serializers.CharField()
    tiene_carnet = serializers.SerializerMethodField()
    total_solicitudes = serializers.SerializerMethodField()

    def get_nombre_completo(self, obj):
        return f"{obj.nombres} {obj.apellidos}".strip()

    def get_cargo(self, obj):
        asig = AsigTrabajo.objects.filter(
            employee=obj.cedulaidentidad
        ).select_related('denominacioncargoid').first()
        if asig and asig.denominacioncargoid:
            return asig.denominacioncargoid.cargo
        return ""

    def get_departamento(self, obj):
        asig = AsigTrabajo.objects.filter(
            employee=obj.cedulaidentidad
        ).select_related('DireccionGeneral').first()
        if asig and asig.DireccionGeneral:
            return asig.DireccionGeneral.direccion_general
        return ""

    def get_codigo(self, obj):
        asig = AsigTrabajo.objects.filter(
            employee=obj.cedulaidentidad
        ).first()
        if asig:
            return asig.codigo
        return ""

    def get_telefono(self, obj):
        return obj.telefono_movil or obj.telefono_habitacion or ""

    def get_tiene_carnet(self, obj):
        return CarnetEmitido.objects.filter(employee=obj, activo=True).exists()

    def get_total_solicitudes(self, obj):
        return CarnetEmitido.objects.filter(employee=obj).count()


class CarnetEmitidoSerializer(serializers.ModelSerializer):
    cedula = serializers.CharField(source='employee.cedulaidentidad', read_only=True)
    nombre_completo = serializers.SerializerMethodField()

    class Meta:
        model = CarnetEmitido
        fields = [
            'id', 'cedula', 'nombre_completo',
            'fecha_emision', 'motivo', 'observaciones', 'activo'
        ]
        read_only_fields = ['fecha_emision']

    def get_nombre_completo(self, obj):
        emp = obj.employee
        return f"{emp.nombres} {emp.apellidos}".strip()


class DenominacioncargoSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    nombre = serializers.CharField(source='cargo')


class DireccionGeneralSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    nombre = serializers.CharField(source='direccion_general')


class CarnetTemplateSerializer(serializers.ModelSerializer):
    imagen_url = serializers.SerializerMethodField()

    class Meta:
        model = CarnetTemplate
        fields = ['id', 'nombre', 'imagen', 'imagen_url', 'activo', 'creado']
        read_only_fields = ['creado']

    def get_imagen_url(self, obj):
        if obj.imagen:
            return obj.imagen.url
        return None

    def validate_imagen(self, value):
        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError('La imagen no debe superar 5MB')
        return value
