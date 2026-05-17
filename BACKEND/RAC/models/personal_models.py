from django.db import models
from .family_personal_models import Parentesco
from USER.models import cuenta

#importacion para las direcciones del personal
from . import ubicacion_models as direccion_models

#importacion del modelo de familiares
from .family_personal_models import Employeefamily

# historial de cambios
from simple_history.models import HistoricalRecords


# cargos 
class Denominacioncargo(models.Model):
    cargo = models.CharField(max_length=200, unique=True)
    orden_by_cargo = models.PositiveIntegerField(default=30)

    class Meta:
        managed = True
        db_table = 'DenominacionCargo'
        app_label = 'RAC'
        ordering = ['cargo']

class Denominacioncargoespecifico(models.Model):
    cargo = models.CharField(max_length=200, unique=True)
    orden_by_cargo = models.PositiveIntegerField(default=30)
    class Meta:
        managed = True
        db_table = 'DenominacionCargoEspecifico'
        app_label = 'RAC'
        ordering = ['cargo']
        
 
class TipoComision(models.Model):
    tipo_comision = models.CharField(max_length=20, unique=True)


    class Meta:
        managed = True
        db_table = 'TipoComision'
        app_label = 'RAC'

# organismos adscritos  
class OrganismoAdscrito(models.Model):
     Organismoadscrito = models.CharField(max_length=50, unique=True,db_column='organismoAdscrito')
     
     parent = models.ForeignKey(
        'self', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='sub_organismos',
        db_column='parent_id'
    )
     class Meta:
        managed = True
        app_label = 'RAC'
        db_table = 'OrganismoAdscrito'
        ordering = ['Organismoadscrito']
        

class NivelAcademico(models.Model):
    nivelacademico = models.CharField(max_length=50, unique=True,db_column='nivelAcademico')

    class Meta:
        managed = True
        db_table = 'NivelAcademico'
        ordering = ['nivelacademico']
        app_label = 'RAC'
        

class Grado(models.Model):
    grado = models.CharField(max_length=50, unique=True)

    class Meta:
        managed = True
        db_table = 'Grado'
        app_label = 'RAC'


class Tiponomina(models.Model):
    nomina = models.CharField(max_length=50, unique=True)
    requiere_codig = models.BooleanField(db_column='requiereCodig',default=False)
    es_activo = models.BooleanField(default=True)
    class Meta:
        managed = True
        db_table = 'TipoNomina'
        ordering = ['nomina']
        app_label = 'RAC'
        


class Dependencias(models.Model):
    Codigo = models.CharField(max_length=20, unique=True)
    dependencia = models.CharField(max_length=200, unique=True)

    class Meta:
        managed = True
        db_table = 'Dependencias'
        ordering = ['Codigo']
        app_label = 'RAC'


class DireccionGeneral(models.Model):
    Codigo = models.CharField(max_length=20, unique=True)
    direccion_general = models.CharField(max_length=200, unique=True)
    dependenciaId = models.ForeignKey('Dependencias', models.DO_NOTHING,null=True, default=1, db_column='dependenciaId')

    class Meta:
        managed = True
        db_table = 'DireccionGeneral'
        ordering = ['Codigo']
        app_label = 'RAC'
    
class DireccionLinea(models.Model):
    Codigo = models.CharField(max_length=20, unique=True)
    direccion_linea = models.CharField(max_length=200, unique=True)
    direccionGeneral = models.ForeignKey('DireccionGeneral', models.DO_NOTHING, db_column='direccionGeneralId')
    class Meta:
        managed = True
        db_table = 'DireccionLinea'
        ordering = ['Codigo']
        app_label = 'RAC'

class Coordinaciones(models.Model):
    Codigo = models.CharField(max_length=20, unique=True)
    coordinacion = models.CharField(max_length=200, unique=True)
    direccionLinea = models.ForeignKey('DireccionLinea', models.DO_NOTHING, null=True, blank=True,db_column='direccionLineaId')
    class Meta:
        managed = True
        db_table = 'Coordinaciones'
        ordering = ['Codigo']
        app_label = 'RAC'


class Estatus(models.Model):
    estatus = models.CharField(max_length=50, unique=True)

    class Meta:
        managed = True
        db_table = 'Estatus'
        app_label = 'RAC'


class Tipo_personal(models.Model):
    TipoChoices = [
        ('ACTIVO', 'ACTIVO'),
        ('PASIVO', 'PASIVO'),  
    ]
    tipo_personal = models.CharField(db_column='tipoPersonal',choices=TipoChoices,  unique=True) 

    class Meta:
        managed = True
        db_table = 'TipoPersonal'
        app_label = 'RAC'

# datos personales 

class Sexo(models.Model):
    sexo = models.CharField(max_length=50, unique=True)

    class Meta:
        managed = True
        db_table = 'Sexo'
        app_label = 'RAC'

class categorias_discapacidad(models.Model):
    nombre_categoria = models.CharField(max_length=100, unique=True)

    class Meta:
        managed = True
        app_label = 'RAC'

class categorias_patologias(models.Model):
    nombre_categoria = models.CharField(max_length=100, unique=True)

    class Meta:
        managed = True
        app_label = 'RAC'

class patologias_Cronicas(models.Model):
    patologia = models.CharField(max_length=200, unique=True)
    categoria_id = models.ForeignKey(categorias_patologias, models.DO_NOTHING, db_column='categoriaId')

    class Meta:
        managed = True
        app_label = 'RAC'
    
    
class Discapacidades(models.Model):
    discapacidad = models.CharField(max_length=200, unique=True)
    categoria_id = models.ForeignKey(categorias_discapacidad, models.DO_NOTHING, db_column='categoriaId')

    class Meta:
        managed = True
        app_label = 'RAC'
        
        
class categorias_alergias(models.Model):
    nombre_categoria = models.CharField(max_length=100, unique=True)

    class Meta:
        managed = True
        app_label = 'RAC'
        
class Alergias(models.Model):
    alergia = models.CharField(max_length=100, unique=True)
    categoria_id = models.ForeignKey(categorias_alergias, models.DO_NOTHING, db_column='categoriaId')
    
    class Meta:
        managed = True
        app_label = 'RAC'
        
    
class estado_civil(models.Model):
    estadoCivil = models.CharField(max_length=100, unique=True)
    
    class Meta:
        managed = True
        app_label = 'RAC'
# tallas vestimenta 

class Talla_Camisas(models.Model):
    talla = models.CharField(max_length=50, unique=True)

    class Meta:
        managed = True
        app_label = 'RAC'
        ordering = ['id']

class Talla_Pantalones(models.Model):
    talla = models.CharField(max_length=50, unique=True)

    class Meta:
        managed = True
        app_label = 'RAC'
        ordering = ['id']

class Talla_Zapatos(models.Model):
    talla = models.CharField(max_length=50, unique=True)

    class Meta:
        managed = True
        app_label = 'RAC'
        ordering = ['id']

class GrupoSanguineo(models.Model):
    GrupoSanguineo = models.CharField(max_length=50, unique=True, verbose_name='Descripción')

    class Meta:
        managed = True
        app_label = 'RAC'

class carreras(models.Model):
    nombre_carrera = models.CharField(max_length=200, unique=True)

    class Meta:
        managed = True
        app_label = 'RAC'
        ordering = ['nombre_carrera']

class Menciones(models.Model):
    carrera_id = models.ForeignKey(carreras, models.DO_NOTHING, db_column='carreraId')
    nombre_mencion = models.CharField(max_length=200)
   
    class Meta:
        managed = True
        unique_together = ('carrera_id', 'nombre_mencion')
        app_label = 'RAC'
        ordering = ['nombre_mencion']
    

class Instituciones(models.Model):
    nombre_institucion = models.CharField(max_length=200, unique=True)

    class Meta:
        managed = True
        app_label = 'RAC'
        ordering = ['nombre_institucion']


class Capacitaciones(models.Model):
    nombre_capacitacion = models.CharField(max_length=200, unique=True)

    class Meta:
        managed = True
        app_label = 'RAC'
        ordering = ['nombre_capacitacion']

class condicion_vivienda(models.Model):
    condicion = models.CharField(max_length=100, unique=True)

    class Meta:
        managed = True
        app_label = 'RAC'
        
        
class contacto_emergencia(models.Model):
    empleado_id = models.ForeignKey('Employee', models.DO_NOTHING, db_column='empleadoId', null=True, blank=True)
    nombres = models.CharField(max_length=100)
    apellidos = models.CharField(max_length=100)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    RelacionId = models.ForeignKey('Parentesco', models.DO_NOTHING, db_column='relacionId', blank=True, null=True)

    class Meta:
        managed = True
        db_table ='contacto_emergencia'

class datos_vivienda(models.Model):
    empleado_id = models.ForeignKey('Employee', models.DO_NOTHING, db_column='empleadoId', null=True, blank=True)
    familiar_id = models.ForeignKey(Employeefamily, models.DO_NOTHING, db_column='familiarId', null=True, blank=True)
    estado_id = models.ForeignKey(direccion_models.Estado, models.DO_NOTHING, db_column='estadoId')
    municipio_id = models.ForeignKey(direccion_models.Municipio, models.DO_NOTHING, db_column='municipioId')
    parroquia = models.ForeignKey(direccion_models.Parroquia, models.DO_NOTHING, db_column='parroquiaId')
    direccion_exacta = models.TextField(db_column='direccionExacta')
    condicion_vivienda_id = models.ForeignKey(condicion_vivienda, models.DO_NOTHING, db_column='condicionViviendaId')
    

    class Meta:
        managed = True
        db_table = 'datos_vivienda'
        app_label = 'RAC'


class perfil_salud(models.Model):
    empleado_id = models.ForeignKey('Employee', models.DO_NOTHING, db_column='empleadoId', null=True, blank=True)
    familiar_id = models.ForeignKey(Employeefamily, models.DO_NOTHING, db_column='familiarId', null=True, blank=True)
    grupoSanguineo = models.ForeignKey('GrupoSanguineo', models.DO_NOTHING, db_column='grupoSanguineoId', blank=True, null=True)
    alergias = models.ManyToManyField(Alergias, blank=True)
    patologiaCronica = models.ManyToManyField(patologias_Cronicas, blank=True)
    discapacidad = models.ManyToManyField(Discapacidades, blank=True)
    
    class Meta:
        managed = True
        db_table = 'perfil_salud'
        app_label = 'RAC'

class perfil_fisico(models.Model):
    empleado_id = models.ForeignKey('Employee', models.DO_NOTHING, db_column='empleadoId', null=True, blank=True)
    familiar_id = models.ForeignKey(Employeefamily, models.DO_NOTHING, db_column='familiarId', null=True, blank=True)
    tallaCamisa = models.ForeignKey(Talla_Camisas,models.DO_NOTHING, db_column='tallaCamisaId', blank=True, null=True)
    tallaPantalon = models.ForeignKey(Talla_Pantalones, models.DO_NOTHING, db_column='tallaPantalonId', blank=True, null=True)
    tallaZapatos = models.ForeignKey(Talla_Zapatos, models.DO_NOTHING, db_column='tallaZapatosId', blank=True, null=True)
    
    class Meta:
        managed = True
        db_table = 'perfil_fisico'
        app_label = 'RAC'
    

class formacion_academica(models.Model):
    empleado_id = models.ForeignKey('Employee', models.DO_NOTHING, db_column='empleadoId', null=True, blank=True)
    familiar_id = models.ForeignKey(Employeefamily, models.DO_NOTHING, db_column='familiarId', null=True, blank=True)
    nivel_Academico_id = models.ForeignKey('NivelAcademico', models.DO_NOTHING, db_column='nivelAcademicoId', blank=True, null=True)
    carrera_id = models.ForeignKey('carreras', models.DO_NOTHING, db_column='carreraId', blank=True, null=True)
    mencion_id = models.ForeignKey('Menciones', models.DO_NOTHING, db_column='mencionId', blank=True, null=True)
    institucion = models.CharField(max_length=200, blank=True, null=True)
   
   
    
    class Meta:
        managed = True
        db_table = 'formacion_academica'
        app_label = 'RAC'

class formacion_complementaria(models.Model):
    empleado_id = models.ForeignKey('Employee', models.DO_NOTHING, db_column='empleadoId', null=True, blank=True)
    capacitacion = models.CharField(max_length=200, blank=True, null=True)
    institucion = models.CharField(max_length=200, blank=True, null=True)
    fecha_inicio = models.DateField(db_column='fechaInicio', blank=True, null=True)
    fecha_fin = models.DateField(db_column='fechaFin', blank=True, null=True)
    class Meta:
        managed = True
        db_table = 'formacion_complementaria'
        app_label = 'RAC'

class antecedentes_servicio(models.Model):
    empleado_id = models.ForeignKey('Employee', models.DO_NOTHING, db_column='empleadoId', null=True, blank=True)
    institucion = models.CharField(max_length=200, blank=True, null=True)
    fecha_ingreso = models.DateField(db_column='fechaIngreso', blank=True, null=True)
    fecha_egreso = models.DateField(db_column='fechaEgreso', blank=True, null=True)
    
    class Meta:
        managed = True
        db_table = 'antecedentes_servicio'
        app_label = 'RAC'
    



        

class Employee(models.Model):
    cedulaidentidad = models.TextField(db_column='cedulaIdentidad', unique=True)
    nombres = models.TextField()
    apellidos = models.TextField() 
    fecha_nacimiento = models.DateField(db_column='fechaNacimiento', blank=True, null=True)
    profile = models.TextField(blank=True, null=True)
    fechaingresoorganismo = models.DateField(db_column='fechaIngresoOrganismo', blank=True, null=True)
    total_anos_apn = models.DecimalField(db_column='total_anos_apn',max_digits=5,decimal_places=2,default=0.00,editable=False)
    n_contrato = models.TextField(null=True, max_length=50)
    sexoid = models.ForeignKey('Sexo', models.DO_NOTHING, db_column='sexoId')
    estadoCivil = models.ForeignKey(estado_civil, models.DO_NOTHING, db_column='estadoCivilId', blank=True, null=True)
    correo = models.EmailField(blank=True, null=True)
    telefono_habitacion = models.CharField(max_length=20, blank=True, null=True)
    telefono_movil = models.CharField(max_length=20, blank=True, null=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True) 

    class Meta:
        managed = True
        db_table = 'Employee'
        ordering = ['-fecha_actualizacion']
        app_label = 'RAC'



class AsigTrabajo(models.Model):
    employee = models.ForeignKey(
        Employee, 
        models.SET_NULL,
        related_name='assignments',
        to_field='cedulaidentidad',
        db_column='employeeCedula', null=True, blank=True
    )
    codigo = models.CharField(max_length=20) 
    denominacioncargoid = models.ForeignKey('Denominacioncargo', models.DO_NOTHING, db_column='denominacionCargoId')
    denominacioncargoespecificoid = models.ForeignKey('Denominacioncargoespecifico', models.DO_NOTHING, db_column='denominacionCargoEspecificoId') 
    OrganismoAdscritoid = models.ForeignKey('OrganismoAdscrito', models.DO_NOTHING, db_column='organismoAdscritoId', blank=True, null=True)
    gradoid = models.ForeignKey('Grado', models.DO_NOTHING, db_column='gradoId', blank=True, null=True) 
    tiponominaid = models.ForeignKey('Tiponomina', models.DO_NOTHING, db_column='tipoNominaId')
    Dependencia = models.ForeignKey('Dependencias', models.DO_NOTHING, db_column='dependenciaId', blank=True,default=1, null=True)
    DireccionGeneral =  models.ForeignKey(DireccionGeneral, models.DO_NOTHING, db_column='direccionGeneralId', blank=True, null=True)
    DireccionLinea = models.ForeignKey(DireccionLinea, models.DO_NOTHING, db_column='direccionLineaId', blank=True, null=True)
    Coordinacion = models.ForeignKey(Coordinaciones, models.DO_NOTHING, db_column='coordinacionId', blank=True, null=True)
    estatusid = models.ForeignKey('Estatus', models.DO_NOTHING, db_column='estatusId') 
    encargaduria = models.BooleanField(default=False)
    Tipo_personal = models.ForeignKey('Tipo_personal', models.DO_NOTHING, db_column='tipoPersonalId', blank=True, null=True)
    tipo_comision = models.ForeignKey('TipoComision', models.DO_NOTHING, db_column='tipo_comision_id', blank=True, null=True)
    observaciones = models.TextField(blank=True, null=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        managed = True
        db_table = 'AsigTrabajo'
        unique_together = ('codigo','tiponominaid')
        ordering = ['-fecha_actualizacion']
        app_label = 'RAC'
        
    
    
