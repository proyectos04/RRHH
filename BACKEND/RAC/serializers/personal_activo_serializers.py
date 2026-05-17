
    #importaciones de rest framework
from rest_framework import serializers

# importaciones de modelos y utilidades
from django.db import transaction
from ..models.personal_models import *
from ..models.historial_personal_models import Tipo_movimiento
#importacion de servicios
from ..services.generacion_codigo import generador_codigos, generar_prefijo_nomina 
from ..serializers.catalogs_serializers import *
from ..utils.constants import * 

from USER.models.user_models import cuenta as User

from ..services.constants_historial import registrar_historial_movimiento
from ..services.profile_services import (
    upsert_vivienda, upsert_health_profile, upsert_physical_profile,
    upsert_academic_profile, replace_complementaria,
    replace_contacto_emergencia, replace_antecedentes,
)
from ..services.dependency_validators import validate_dependency_hierarchy


        

# -------------------------------------------------------------
# serializers para el registro y actualizacion de datos personales 
# -------------------------------------------------------------      

class EmployeeCreateUpdateSerializer(CleanZerosMixin, serializers.ModelSerializer):
    usuario_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), write_only=True)
    fecha_nacimiento =serializers.DateField(
        input_formats=['iso-8601', '%Y-%m-%d','%Y-%m-%dT%H:%M:%S.%fZ']
    )
    fechaingresoorganismo = serializers.DateField(
        input_formats=['iso-8601', '%Y-%m-%d','%Y-%m-%dT%H:%M:%S.%fZ']
    )
    datos_vivienda = DatosViviendaSerializer(required=False)
    perfil_salud = PerfilSaludSerializer(required=False)
    contacto_emergencia = ContactoEmergenciaSerializer(many=True, required=False)
    perfil_fisico = PerfilFisicoSerializer(required=False)
    formacion_academica = FormacionAcademicaSerializer(required=False)
    formacion_complementaria = FormacionComplementariaSerializer(many=True,required=False, write_only=True)
    antecedentes = AntecedentesServicioSerializer(many=True, required=False)
    
    
    class Meta:
        model = Employee
        fields = '__all__'
        extra_kwargs = {
            'cedulaidentidad': {'write_only': False}
        }
        
    
    def validate_cedulaidentidad(self, value):
        if self.instance and self.instance.cedulaidentidad != value:
            raise serializers.ValidationError("La cedula de identidad no puede ser modificada")
        return value    
    
    def validate_nombres(self, value): return value.upper() if value else value
    def validate_apellidos(self, value): return value.upper() if value else value
    
    @transaction.atomic
    def create(self, validated_data):
        usuario_obj = validated_data.pop('usuario_id')
        nested_data = self._pop_nested_data(validated_data)
        
        instance = Employee.objects.create(**validated_data)
        instance._history_user = usuario_obj
        instance.save()

      
        self._handle_nested_data(instance, nested_data)
        return instance
    
    @transaction.atomic
    def update(self, instance, validated_data):
        usuario_obj = validated_data.pop('usuario_id', None)
        if usuario_obj:
            instance._history_user = usuario_obj

        nested_data = self._pop_nested_data(validated_data)
        
        instance = super().update(instance, validated_data)

        self._handle_nested_data(instance, nested_data)
        return instance
    
    def _pop_nested_data(self, validated_data):
        return {
            'vivienda': validated_data.pop('datos_vivienda', None),
            'salud': validated_data.pop('perfil_salud', None),
            'fisico': validated_data.pop('perfil_fisico', None),
            'academico': validated_data.pop('formacion_academica', None),
            'complementaria': validated_data.pop('formacion_complementaria', None),
            'contacto_emergencia': validated_data.pop('contacto_emergencia', None),
            'antecedentes': validated_data.pop('antecedentes', None)
        }

    def _handle_nested_data(self, instance, nested):
        upsert_vivienda(instance, nested.get('vivienda'))
        upsert_health_profile(instance, nested.get('salud'), 'empleado_id')
        upsert_physical_profile(instance, nested.get('fisico'), 'empleado_id')
        upsert_academic_profile(instance, nested.get('academico'), 'empleado_id')
        replace_complementaria(instance, nested.get('complementaria'))
        replace_contacto_emergencia(instance, nested.get('contacto_emergencia'))
        replace_antecedentes(instance, nested.get('antecedentes'))
                          
# -------------------------------------------------------------
# serializers para listar datos personales 
# -------------------------------------------------------------  
class EmployeeListSerializer(serializers.ModelSerializer):
    sexo = SexoSerializer(source='sexoid', read_only=True)
    estadoCivil = EstadoCivilSerializer(read_only=True)

    datos_vivienda = serializers.SerializerMethodField()
    perfil_salud = serializers.SerializerMethodField()
    perfil_fisico = serializers.SerializerMethodField()
    contacto_emergencia = serializers.SerializerMethodField()
    formacion_academica = FormacionAcademicaSerializer(source='formacion_academica_set', many=True, read_only=True)
    formacion_complementaria = FormacionComplementariaSerializer(source='formacion_complementaria_set', many=True, read_only=True)
    
    antecedentes = AntecedentesServicioSerializer(source='antecedentes_servicio_set', many=True,read_only=True)
    
    
    class Meta:
        model = Employee
        fields = [
            'id', 
            'cedulaidentidad', 
            'nombres', 
            'apellidos',
            'profile',
            'fecha_nacimiento',
            'fechaingresoorganismo',
            'n_contrato', 
            'sexo', 
            'estadoCivil',
            'datos_vivienda',
            'perfil_salud', 
            'perfil_fisico', 
            'formacion_academica',
            'formacion_complementaria',
            'contacto_emergencia',
            'antecedentes',
            'fecha_actualizacion'
        ]
        
    def get_datos_vivienda(self, obj):
        vivienda = obj.datos_vivienda_set.first() 
        return DatosViviendaSerializer(vivienda).data if vivienda else None

    def get_perfil_salud(self, obj):
        salud = obj.perfil_salud_set.first()
        return PerfilSaludSerializer(salud).data if salud else None

    def get_perfil_fisico(self, obj):
        fisico = obj.perfil_fisico_set.first()
        return PerfilFisicoSerializer(fisico).data if fisico else None
    
    def get_contacto_emergencia(self, obj):
        emergencia = obj.contacto_emergencia_set.first()
        return ContactoEmergenciaSerializer(emergencia).data if emergencia else None


    def get_formacion_academica(self, obj):
        academico = obj.formacion_academica_set.first()
        return FormacionAcademicaSerializer(academico).data if academico else None
    


# -------------------------------------------------------------
# serializers para el registro y actualizacion de datos de cargo
# ------------------------------------------------------------- 


class CodigosCreateUpdateSerializer(CleanZerosMixin, serializers.ModelSerializer):
    usuario_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), write_only=True)     
    
    class Meta:
        model = AsigTrabajo   
        exclude = ['employee',  'Tipo_personal', 'estatusid', 'observaciones']  
        
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance:
            self.fields['codigo'].read_only = True
        else:
            self.fields['OrganismoAdscritoid'].read_only = True
            self.fields['tipo_comision'].read_only = True
             
    def validate_tiponominaid(self, value):
        if not self.instance or self.instance.tiponominaid != value:
            if value.requiere_codig:
               raise serializers.ValidationError('Tipo de nómina no permitido')
        return value 
    
    def validate(self, attrs):
        try:
            if not getattr(self, 'instance', None):
               attrs['estatusid'] = Estatus.objects.get(estatus__iexact=ESTATUS_VACANTE)
            attrs['Tipo_personal'] = Tipo_personal.objects.get(tipo_personal__iexact=PERSONAL_ACTIVO)
        except (Estatus.DoesNotExist, Tipo_personal.DoesNotExist) as e:
            raise serializers.ValidationError(f"Error de datos: {str(e)}")     
        
        codigo = attrs.get('codigo', getattr(self.instance, 'codigo', None))
        tiponominaid = attrs.get('tiponominaid', getattr(self.instance, 'tiponominaid', None))

        if codigo and tiponominaid:
            queryset = AsigTrabajo.objects.filter(codigo=codigo, tiponominaid=tiponominaid)
            
            if self.instance:
                queryset = queryset.exclude(pk=self.instance.pk)
            
            if queryset.exists():
                raise serializers.ValidationError(
                     f"Ya existe el código {codigo} para este tipo de nómina"
                )
        
        try:
            validate_dependency_hierarchy(
                dependencia=attrs.get('Dependencia', getattr(self.instance, 'Dependencia', None)),
                direccion_general=attrs.get('DireccionGeneral', getattr(self.instance, 'DireccionGeneral', None)),
                direccion_linea=attrs.get('DireccionLinea', getattr(self.instance, 'DireccionLinea', None)),
                coordinacion=attrs.get('Coordinacion', getattr(self.instance, 'Coordinacion', None)),
            )
        except ValueError as e:
            raise serializers.ValidationError(str(e))

        if self.instance and self.instance.tiponominaid and self.instance.tiponominaid.requiere_codig:
            
            nuevo_grado = attrs.get('grado')
            nueva_nomina = attrs.get('tiponominaid')

            if nuevo_grado is not None and nuevo_grado != self.instance.grado:
                raise serializers.ValidationError("No se permite actualizar el grado cuando es un cargo especial")
            
            if nueva_nomina is not None and nueva_nomina != self.instance.tiponominaid:
                raise serializers.ValidationError("No se permite actualizar el tipo de nómina cuando es un cargo especial")
     

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        usuario = validated_data.pop('usuario_id')
        instance = AsigTrabajo.objects.create(**validated_data)
        instance.save()
            
        return instance
    
    @transaction.atomic
    def update(self, instance, validated_data):
        usuario = validated_data.pop('usuario_id')
        return super().update(instance, validated_data)



# -------------------------------------------------------------
# serializers para listar datos de cargo
# -------------------------------------------------------------   
class ListerCodigosSerializer(serializers.ModelSerializer):

    denominacioncargo = denominacionCargoSerializer(
        source='denominacioncargoid', read_only=True
    )
    denominacioncargoespecifico = denominacionCargoEspecificoSerializer(
        source='denominacioncargoespecificoid', read_only=True
    )
    grado = gradoSerializer(source='gradoid', read_only=True)
    tiponomina =TipoNominaGeneralSerializer(source='tiponominaid', read_only=True)
    OrganismoAdscrito = OrganismoAdscritoSerializer(
        source='OrganismoAdscritoid', read_only=True
    )
    tipo_comision = TipoComisionSerializers(read_only=True)
    Dependencia = DependenciaSerializer(read_only=True)
    DireccionGeneral = DireccionGeneralSerializer(read_only=True)
    DireccionLinea = DireccionLineaSerializer(read_only=True)
    Coordinacion = CoordinacionSerializer(read_only=True)
    estatusid = EstatusSerializer(read_only=True)

    class Meta:
        model = AsigTrabajo
        fields = [
            'id',
            'codigo',
            'denominacioncargo',
            'denominacioncargoespecifico',
            'encargaduria',
            'grado',
            'tiponomina',
            'OrganismoAdscrito',
            'tipo_comision',
            'Dependencia',
            'DireccionGeneral',
            'DireccionLinea',
            'Coordinacion',
            'estatusid',
            'observaciones',
            'fecha_actualizacion',
        ]
      
# -------------------------------------------------------------
# serializers para asignar cargo
# -------------------------------------------------------------         
class EmployeeAssignmentSerializer(serializers.ModelSerializer):
    employee = serializers.SlugRelatedField(
        slug_field='cedulaidentidad',
        queryset=Employee.objects.all(),
        required=True,
        error_messages={
            'required': 'Debe proporcionar la cédula del empleado para realizar la asignación'
        }
    )
    usuario_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), 
        write_only=True,
        required=True
    )

    class Meta:
        model = AsigTrabajo
        fields = ['employee', 'usuario_id','encargaduria']

    def validate(self, attrs):
        if self.instance and self.instance.employee is not None:
            raise serializers.ValidationError("Este código ya está ocupado por el empleado")

        try:
            attrs['estatus_activo'] = Estatus.objects.get(estatus__iexact='ACTIVO')
            attrs['motivo_ingreso'] = Tipo_movimiento.objects.get(movimiento__iexact="ASIGNACION DE CARGO")
        except Estatus.DoesNotExist:
            raise serializers.ValidationError("El estatus 'ACTIVO' no esta en el sistema")
        except Tipo_movimiento.DoesNotExist:
            raise serializers.ValidationError("El motivo 'ASIGNACION DE CARGO' no esta configurado")

        return attrs

    @transaction.atomic
    def update(self, instance, validated_data):
        usuario = validated_data.pop('usuario_id')
        estatus_activo = validated_data.pop('estatus_activo')
        motivo_ingreso = validated_data.pop('motivo_ingreso')
        nuevo_empleado = validated_data.pop('employee')
        encargaduria = validated_data.pop('encargaduria', None)

        instance.employee = nuevo_empleado
        instance.estatusid = estatus_activo
        if encargaduria is not None:
            instance.encargaduria = encargaduria
        instance.save()

        registrar_historial_movimiento(
            empleado=nuevo_empleado,
            puesto=instance,
            tipo_movimiento='INGRESO',
            motivo=motivo_ingreso,
            usuario=usuario
        )

        return instance


# -------------------------------------------------------------
# serializers para asignar cargo especial
# -------------------------------------------------------------     
class SpecialPositionAutoCreateSerializer(CleanZerosMixin, serializers.ModelSerializer):
    usuario_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), 
        write_only=True
    )

    class Meta: 
        model = AsigTrabajo
        exclude = ['Tipo_personal', 'estatusid', 'codigo', 'observaciones','encargaduria']

    def validate_tiponominaid(self, value):
        if not value.requiere_codig:
            raise serializers.ValidationError(
                'Esta nomina no permite generación automática de códigos especiales'
            )
        return value

    def validate(self, attrs):
        try:
            attrs['estatus_obj'] = Estatus.objects.get(estatus__iexact=ESTATUS_ACTIVO)
            attrs['personal_obj'] = Tipo_personal.objects.get(tipo_personal__iexact=PERSONAL_ACTIVO)
            attrs['motivo_obj'] = Tipo_movimiento.objects.get(movimiento__iexact="ASIGNACION DE CARGO")
        except (Estatus.DoesNotExist, Tipo_personal.DoesNotExist, Tipo_movimiento.DoesNotExist) as e:
            raise serializers.ValidationError(f"Error de configuración: {str(e)}")

        tipo_nomina = attrs.get('tiponominaid')
        try:
            prefix = generar_prefijo_nomina(tipo_nomina)
        except ValueError as e:
            raise serializers.ValidationError(str(e))
        attrs['codigo_generado'] = generador_codigos(prefix)

        return attrs 
    
    @transaction.atomic
    def create(self, validated_data):

        usuario = validated_data.pop('usuario_id')
        estatus = validated_data.pop('estatus_obj')
        personal = validated_data.pop('personal_obj')
        motivo = validated_data.pop('motivo_obj')
        codigo = validated_data.pop('codigo_generado')

        validated_data['estatusid'] = estatus
        validated_data['Tipo_personal'] = personal
        validated_data['codigo'] = codigo

        instance = AsigTrabajo.objects.create(**validated_data)
        instance.save()

        registrar_historial_movimiento(
            empleado=instance.employee, 
            puesto=instance,
            tipo_movimiento='INGRESO',
            motivo=motivo,
            usuario=usuario
        )

        return instance   
# -------------------------------------------------------------
# serializers para listar datos de cargo y personales
# ------------------------------------------------------------- 
class EmployeeDetailSerializer(serializers.ModelSerializer):

    sexo = SexoSerializer(source='sexoid', read_only=True)
    estadoCivil = EstadoCivilSerializer(read_only=True)
    datos_vivienda = serializers.SerializerMethodField()
    perfil_salud = serializers.SerializerMethodField()
    contacto_emergencia = serializers.SerializerMethodField()
    perfil_fisico = serializers.SerializerMethodField()
    formacion_academica = serializers.SerializerMethodField()
    formacion_complementaria = FormacionComplementariaSerializer(source='formacion_complementaria_set', many=True, read_only=True)
    anos_apn = serializers.IntegerField(source='total_anos_apn', read_only=True)
    antecedentes = AntecedentesServicioSerializer(
        source='antecedentes_servicio_set', many=True,read_only=True)

    asignaciones = ListerCodigosSerializer(source='assignments',many=True,read_only=True)

    class Meta:
        model = Employee
        fields = [
            'id', 
            'cedulaidentidad', 
            'nombres',
            'apellidos', 
            'profile',
            'fecha_nacimiento',
            'fechaingresoorganismo',
            'n_contrato', 
            'sexo',
            'estadoCivil', 
            'correo',
            'telefono_habitacion',
            'telefono_movil',
            'datos_vivienda', 
            'perfil_salud',
            'contacto_emergencia',
            'perfil_fisico', 
            'formacion_academica',
            'formacion_complementaria',
            'antecedentes',
            'anos_apn', 
            'fecha_actualizacion', 
            'asignaciones'
        ]
    
    def get_datos_vivienda(self, obj):
        vivienda = obj.datos_vivienda_set.first()
        return DatosViviendaSerializer(vivienda).data if vivienda else None

    def get_perfil_salud(self, obj):
        salud = obj.perfil_salud_set.first()
        return PerfilSaludSerializer(salud).data if salud else None
    
    def get_contacto_emergencia(self, obj):
        emergencia = obj.contacto_emergencia_set.first()
        return ContactoEmergenciaSerializer(emergencia).data if emergencia else None

    def get_perfil_fisico(self, obj):
        fisico = obj.perfil_fisico_set.first()
        return PerfilFisicoSerializer(fisico).data if fisico else None
    

    def get_formacion_academica(self, obj):
        academica = obj.formacion_academica_set.first()
        return FormacionAcademicaSerializer(academica).data if academica else None
    
    
    
    # ..........................................................
    
    
    
class CargaMasivaSerializer(serializers.Serializer):
    archivo = serializers.FileField()




class CargosUploadSerializer(serializers.Serializer):
    archivo = serializers.FileField()

