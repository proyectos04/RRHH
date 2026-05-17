from django.db import models


# Create your models here.
class departaments(models.Model):
    id = models.AutoField(primary_key=True)
    nombre_departamento = models.CharField(max_length=100, unique=True)
    descripcion_departamento = models.TextField(null=True, blank=True)

    class Meta:
        managed = True
        app_label = 'USER'


class Rol(models.Model):
    id = models.AutoField(primary_key=True)
    nombre_rol = models.CharField(max_length=50, unique=True) 
    descripcion_rol = models.TextField(null=True, blank=True)

    class Meta:
        managed = True
        app_label = 'USER'
  
class cuenta(models.Model):
   
    cedula = models.OneToOneField(
        "RAC.Employee", 
        on_delete=models.CASCADE, 
        to_field='cedulaidentidad', 
        db_column='cedula'
    )
  
    password = models.CharField(max_length=100)
  

    departamento = models.ForeignKey(departaments, on_delete=models.CASCADE, null=True, blank=True,db_column='departamento_id')
    rol = models.ForeignKey(
        Rol, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        db_column='rol_id'
    )
    
    is_active = models.BooleanField(default=True)
    class Meta:
        managed = True
        app_label = 'USER'

