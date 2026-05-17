from rest_framework import serializers, validators
from rest_framework.validators import UniqueValidator

# importaciones de modelos y utilidades
from ..models.personal_models import *
from ..models.ubicacion_models import *
from ..models.family_personal_models import Parentesco

from ..utils.data_formatters import *


 


# ////////////////////////       
# ORGANISMO ADSCRITO 
# ////////////////////////

class TipoComisionSerializers(serializers.ModelSerializer):
    class Meta:
        model = TipoComision
        fields = '__all__'

class OrganismoAdscritoSerializer(serializers.ModelSerializer):
    Organismoadscrito = serializers.CharField(
       validators=[
            UniqueValidator(
                queryset=OrganismoAdscrito.objects.all(),
                message="El Organismo Adscrito '{value}' ya se encuentra registrado"
            )
        ]
    )
    class Meta:
        model = OrganismoAdscrito   
        fields = ['id', 'Organismoadscrito'] 
        
    def validate_Organismoadscrito(self,value):
        return value.strip().upper()
        




class SexoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sexo
        fields = '__all__'
        
        
class EstadoCivilSerializer(serializers.ModelSerializer):
    class Meta:
        model = estado_civil
        fields = '__all__'
        
class ParentescoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Parentesco
        fields = '__all__'

        
# ////////////////////////
 # DATOS DE ACADEMICOS
# ////////////////////////
 
class NivelAcademicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = NivelAcademico
        fields = "__all__"
        
class CarrerasSerializer(serializers.ModelSerializer):
    class Meta:
        model = carreras
        fields = "__all__"
        
        
class MencionSerializer(serializers.ModelSerializer):
    carrera = CarrerasSerializer(source='carrera_id', read_only=True)
    class Meta:
        model = Menciones
        fields = [
            'id',
            'nombre_mencion',
            'carrera',
            'carrera_id' 
        ]
        
        extra_kwargs = {
            'carrera_id': {'write_only': True}
        }     


class CapacitacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Capacitaciones
        fields = '__all__'


class institucionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Instituciones
        fields = '__all__'

class FormacionAcademicaSerializer(serializers.ModelSerializer):
    nivelAcademico = NivelAcademicoSerializer(source='nivel_Academico_id', read_only=True)
    carrera = CarrerasSerializer(source='carrera_id', read_only=True)
    mencion = MencionSerializer(source='mencion_id', read_only=True)
    nivel_Academico_id = serializers.PrimaryKeyRelatedField(
        queryset=NivelAcademico.objects.all(), 
        write_only=True, required=False, allow_null=True
    )
    carrera_id = serializers.PrimaryKeyRelatedField(
        queryset=carreras.objects.all(), 
        write_only=True, required=False, allow_null=True
    )
    mencion_id = serializers.PrimaryKeyRelatedField(
        queryset=Menciones.objects.all(), 
        write_only=True, required=False, allow_null=True
    )

    class Meta:
        model = formacion_academica
        fields = [
            'id', 'institucion', 
            'nivelAcademico', 'carrera', 'mencion',      
            'nivel_Academico_id', 'carrera_id', 'mencion_id'
        ]
        


class FormacionComplementariaSerializer(serializers.ModelSerializer):
  
    fecha_inicio = serializers.DateField(required=False, allow_null=True,
        input_formats=['iso-8601', '%Y-%m-%dT%H:%M:%S.%fZ', '%Y-%m-%d'])
    fecha_fin = serializers.DateField(required=False, allow_null=True,input_formats=['iso-8601', '%Y-%m-%dT%H:%M:%S.%fZ', '%Y-%m-%d'])


    class Meta:
        model = formacion_complementaria
        fields = [
            'id','capacitacion', 'fecha_inicio', 'fecha_fin',
            'institucion',
           
        ]

# ////////////////////////
# UBICACION DE VIVIENDA
# ////////////////////////


class RegionSerializers(serializers.ModelSerializer):
    class Meta:
        model = Region
        fields = ['id', 'region']
    

class EstadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Estado
        fields = ['id', 'estado']

class MunicipioSerializer(serializers.ModelSerializer):
    estado = serializers.CharField(source='estadoid.estado', read_only=True)
    
    class Meta:
        model = Municipio
        fields = ['id', 'municipio', 'estadoid', 'estado']

class ParroquiaSerializer(serializers.ModelSerializer):
    municipio = serializers.CharField(source='municipioid.municipio', read_only=True)
    
    class Meta:
        model = Parroquia
        fields = ['id', 'parroquia', 'municipioid', 'municipio']


class CondicionViviendaSerializer(serializers.ModelSerializer):
    class Meta:
        model = condicion_vivienda
        fields = '__all__'


class DatosViviendaSerializer(serializers.ModelSerializer):
    estado_id = serializers.PrimaryKeyRelatedField(queryset=direccion_models.Estado.objects.all(), write_only=True)
    municipio_id = serializers.PrimaryKeyRelatedField(queryset=direccion_models.Municipio.objects.all(), write_only=True)
    parroquia = serializers.PrimaryKeyRelatedField(queryset=direccion_models.Parroquia.objects.all()) 
    condicion_vivienda_id = serializers.PrimaryKeyRelatedField(queryset=condicion_vivienda.objects.all(), write_only=True)
    

    class Meta:
        model = datos_vivienda
        fields = [
            'id', 'direccion_exacta', 'parroquia',
            'estado_id', 'municipio_id', 'condicion_vivienda_id'    
        ]

    def to_representation(self, instance):
        ret = super().to_representation(instance)

        try:
            ret['parroquia'] = ParroquiaSerializer(instance.parroquia).data if instance.parroquia is not None else None
        except Exception:
            ret['parroquia'] = None

        try:
            ret['estado'] = EstadoSerializer(instance.estado_id).data if instance.estado_id is not None else None
        except Exception:
            ret['estado'] = None

        try:
            ret['municipio'] = MunicipioSerializer(instance.municipio_id).data if instance.municipio_id is not None else None
        except Exception:
            ret['municipio'] = None

        try:
            ret['condicion'] = CondicionViviendaSerializer(instance.condicion_vivienda_id).data if instance.condicion_vivienda_id is not None else None
        except Exception:
            ret['condicion'] = None

        return ret
        


# ////////////////////////
# DATOS DE VESTIMENTA
# ////////////////////////


class TallaCamisaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Talla_Camisas
        fields = '__all__'
        
        
class TallaPantalonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Talla_Pantalones
        fields = '__all__'
        
        
class TallaZapatosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Talla_Zapatos
        fields = '__all__'
        
        
class PerfilFisicoSerializer(serializers.ModelSerializer):
    

    class Meta:
        model = perfil_fisico
        exclude = ['empleado_id','familiar_id']
        
    def to_representation(self, instance):  
        ret = super().to_representation(instance)
        
        if instance.tallaCamisa:
            ret['tallaCamisa'] = TallaCamisaSerializer(instance.tallaCamisa).data
            
        if instance.tallaPantalon:
            ret['tallaPantalon'] = TallaPantalonSerializer(instance.tallaPantalon).data
            
        if instance.tallaZapatos:
            ret['tallaZapatos'] = TallaZapatosSerializer(instance.tallaZapatos).data
            
        return ret   

        


        
# ////////////////////////
# DATOS DE SALUD 
# ////////////////////////

        
class GrupoSanguineoSerializer(serializers.ModelSerializer):
    class Meta:
        model = GrupoSanguineo
        fields = '__all__'  
        
class categoriasPatologiasSerializer(serializers.ModelSerializer):
    nombre_categoria = serializers.CharField(
        validators=[
            UniqueValidator(
                queryset=categorias_patologias.objects.all(),
                message="La categoria '{value}' ya se encuentra registrada"
            )
        ]
    )

    class Meta:
        model = categorias_patologias
        fields = '__all__'

    def validate_nombre_categoria(self, value):
        return value.strip().upper()


class PatologiasSerializer(serializers.ModelSerializer):
    patologia = serializers.CharField(
        validators=[
            UniqueValidator(
                queryset=patologias_Cronicas.objects.all(),
                message="La patologia '{value}' ya se encuentra registrada"
            )
        ]
    )
    categoria = categoriasPatologiasSerializer(source='categoria_id', read_only=True)
    categoria_id = serializers.PrimaryKeyRelatedField(
        queryset=categorias_patologias.objects.all(), 
        write_only=True
    )

    class Meta:
        model = patologias_Cronicas
        fields = [
            'id',
            'patologia',
            'categoria',    
            'categoria_id'  
        ]
        
    def validate_patologia(self,value): 
        return value.strip().upper()
    
    

class categoriasDiscapacidadesSerializer(serializers.ModelSerializer):
    nombre_categoria = serializers.CharField(
        validators=[
            UniqueValidator(
                queryset=categorias_discapacidad.objects.all(),
                message="La categoria '{value}' ya se encuentra registrada"
            )
        ]
    )
    
    class Meta:
        model = categorias_discapacidad
        fields = [
            'id',
            'nombre_categoria'
        ]
        
    def validate_nombre_categoria(self,value):      
        return value.strip().upper()

class DiscapacidadSerializer(serializers.ModelSerializer):
    discapacidad = serializers.CharField(
        validators=[
            UniqueValidator(
                queryset=Discapacidades.objects.all(),
                message="La Discapacida '{value}' ya se encuentra registrada"
            )
        ]
    )
    categoria = categoriasDiscapacidadesSerializer(source='categoria_id', read_only=True)
    categoria_id = serializers.PrimaryKeyRelatedField(
        queryset=categorias_discapacidad.objects.all(), 
        write_only=True
    )
    class Meta:
        model = Discapacidades
        fields = [
            'id',
            'discapacidad',
            'categoria',      
            'categoria_id'    
        ]  

    def validate_discapacidad(self,value):
        return value.strip().upper()
    
    
class categoriaAlergiaSerializers(serializers.ModelSerializer):
    nombre_categoria = serializers.CharField(
        validators=[
            UniqueValidator(
                queryset=categorias_alergias.objects.all(),
                message="La Categoria '{value}' ya se encuentra registrada"
            )
        ]
    )
    class Meta:
        model = categorias_alergias
        fields = [
            'id',
            'nombre_categoria'
        ]

    def validate_nombre_categoria(self,value):
        return value.strip().upper()

class AlergiasSerializer(serializers.ModelSerializer):
    alergia = serializers.CharField(
        validators=[
            UniqueValidator(
                queryset=Alergias.objects.all(),
                message="La alergia '{value}' ya se encuentra registrada"
            )
        ]
    )
    categoria = categoriaAlergiaSerializers(source='categoria_id', read_only=True)
    categoria_id = serializers.PrimaryKeyRelatedField(
        queryset=categorias_alergias.objects.all(), 
        write_only=True
    )

    class Meta:
        model = Alergias
        fields = [
            'id',
            'alergia',
            'categoria',      
            'categoria_id'    
        ]
        
    def validate_alergia(self,value):
        return  value.strip().upper()
    
  
  
class PerfilSaludSerializer(serializers.ModelSerializer):

    class Meta:
        model = perfil_salud
        exclude = ['empleado_id','familiar_id']
        
    def to_representation(self, instance):

        ret = super().to_representation(instance)

        if instance.grupoSanguineo:
            ret['grupoSanguineo'] = GrupoSanguineoSerializer(instance.grupoSanguineo).data

        ret['discapacidad'] = DiscapacidadSerializer(instance.discapacidad.all(), many=True).data
        
        ret['patologiasCronicas'] = PatologiasSerializer(instance.patologiaCronica.all(), many=True).data
        ret.pop('patologiaCronica', None) 
        
        ret['alergias'] = AlergiasSerializer(instance.alergias.all(), many=True).data

        return ret
        

    
class ContactoEmergenciaSerializer(serializers.ModelSerializer):
    Relacion = ParentescoSerializer(source='RelacionId', read_only=True)
    class Meta:
        model = contacto_emergencia
        fields = [
            'id',
            'nombres',
            'apellidos',
            'telefono',
            'RelacionId',
            'Relacion'
        ]
        extra_kwargs = {
            'RelacionId': {'write_only': True}
        }
        
        
        
class AntecedentesServicioSerializer(serializers.ModelSerializer):

    fecha_ingreso = serializers.DateField(required=False, allow_null=True,
        input_formats=['iso-8601', '%Y-%m-%dT%H:%M:%S.%fZ', '%Y-%m-%d'])
    fecha_egreso = serializers.DateField(required=False, allow_null=True,input_formats=['iso-8601', '%Y-%m-%dT%H:%M:%S.%fZ', '%Y-%m-%d'])
    class Meta:
        model = antecedentes_servicio
        exclude = ['empleado_id']      
    
    def validate_institucion(self,value):
        return value.upper()     


# ////////////////////////
# DEPENDENCIAS
# ////////////////////////



class DependenciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dependencias
        fields = '__all__'
    
    def validate_dependencia(self,value):
        return value.upper()

    
class DireccionGeneralSerializer(serializers.ModelSerializer):
    class Meta:
        model = DireccionGeneral
        fields = '__all__'
    
    def validate_direccion_general(self,value):
        return value.upper()
    
    
class DireccionLineaSerializer(CleanZerosMixin,serializers.ModelSerializer):
    class Meta:
        model = DireccionLinea
        fields = '__all__' 
    
        extra_kwargs = {
            'direccionGeneral': {'write_only': True}
        }
    def validate_direccion_linea(self,value):
        return value.upper()
    
    
class CoordinacionSerializer(CleanZerosMixin,serializers.ModelSerializer):
    class Meta:
        model = Coordinaciones
        fields = [
            'id',
            'Codigo',
            'coordinacion',
            'direccionLinea'
        
        ] 
    
        extra_kwargs = {
            'direccionLinea': {'write_only': True}
         }
    def validate_coordinacion(self,value):
        return value.upper()
    

# ////////////////////////    
# CARGOS 
# ////////////////////////


class denominacionCargoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Denominacioncargo
        fields = [
            'id',
            'cargo'
        ]
        
class denominacionCargoEspecificoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Denominacioncargoespecifico
        fields = [
            'id',
            'cargo'
        ]
        

class gradoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grado
        fields = '__all__' 
        
        

# ////////////////////////
# NOMINA 
# ////////////////////////

class TipoNominaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tiponomina
        fields = [
            'id',
            'nomina'
        ]
        
class TipoNominaGeneralSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tiponomina
        fields =[
            'id',
            'nomina',
            'requiere_codig',
            'es_activo'
            
        ]

# ////////////////////////
# ESTATUS  / TIPO PERSONAL
# ////////////////////////

class EstatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Estatus
        fields = '__all__' 
        
        
class TipoPersonalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tipo_personal
        fields = '__all__' 
        



