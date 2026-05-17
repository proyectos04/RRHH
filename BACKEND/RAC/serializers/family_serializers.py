from rest_framework import serializers
from rest_framework.validators import UniqueTogetherValidator
from django.db import transaction
from ..models.family_personal_models import Employeefamily, Parentesco, FamilyDocument
from ..models.personal_models import *
from USER.models.user_models import cuenta as User
from datetime import date
from RAC.serializers.personal_activo_serializers import *

class FamilyCreateSerializer(serializers.ModelSerializer):
    employeecedula = serializers.ReadOnlyField(source='employeecedula.cedulaidentidad')
    
    cedulaFamiliar = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    fechanacimiento = serializers.DateField(allow_null=True, input_formats=['iso-8601', '%Y-%m-%d','%Y-%m-%dT%H:%M:%S.%fZ'])
    usuario_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    orden_hijo = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    perfil_salud_familiar = PerfilSaludSerializer(required=False)
    perfil_fisico_familiar = PerfilFisicoSerializer(required=False)
    formacion_academica_familiar = FormacionAcademicaSerializer(required=False)

    class Meta:
        model = Employeefamily
        fields = [
            'employeecedula', 'cedulaFamiliar', 'primer_nombre', 'segundo_nombre',
            'primer_apellido', 'segundo_apellido', 'parentesco', 'fechanacimiento',
            'sexo', 'estadoCivil', 'observaciones', 'usuario_id', 'mismo_ente',
            'heredero', 'perfil_salud_familiar', 'perfil_fisico_familiar', 
            'formacion_academica_familiar', 'orden_hijo'
        ]

    def to_internal_value(self, data):
        data = data.copy() if hasattr(data, 'copy') else data
        for campo in ['primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido']:
            if data.get(campo):
                data[campo] = str(data[campo]).strip().upper()

        def limp_ceros(dictionary):
            if not isinstance(dictionary, dict): return dictionary
            for key, value in dictionary.items():
                if isinstance(value, bool): continue
                if isinstance(value, list):
                    dictionary[key] = [item for item in value if item != 0]
                elif value == 0:
                    dictionary[key] = None
            return dictionary
        
        data = limp_ceros(data)
        for obj_key in ['perfil_salud_familiar', 'perfil_fisico_familiar', 'formacion_academica_familiar']:
            if obj_key in data and isinstance(data[obj_key], dict):
                data[obj_key] = limp_ceros(data[obj_key])
            
        return super().to_internal_value(data)

    def validate(self, data):
        empleado = self.context.get('empleado')
        cedula_fam = data.get('cedulaFamiliar')
        parentesco_obj = data.get('parentesco')
        fecha_nac = data.get('fechanacimiento')
        orden_manual = data.get('orden_hijo')

        if empleado and cedula_fam:
            if str(cedula_fam).strip() == str(empleado.cedulaidentidad).strip():
                raise serializers.ValidationError("La cédula del familiar no puede ser igual a la cédula del trabajador")
        
        if not self.instance:
            if cedula_fam and str(cedula_fam).strip().lower() not in ["", "null", "none"]:
                if Employeefamily.objects.filter(employeecedula=empleado, cedulaFamiliar=cedula_fam).exists():
                    raise serializers.ValidationError({
                        "cedulaFamiliar": "Este familiar ya se encuentra registrado para este empleado"
                    })

        if not cedula_fam or str(cedula_fam).strip().lower() in ["", "string", "null"]:
            es_hijo_menor = False

            if parentesco_obj and fecha_nac and empleado:
                nombre_p = str(parentesco_obj.descripcion_parentesco).upper().strip()
                if nombre_p == "HIJO (A)":
                    today = date.today()
                    edad = today.year - fecha_nac.year - ((today.month, today.day) < (fecha_nac.month, fecha_nac.day))
                    
                    if edad < 9:
                        es_hijo_menor = True
                        cedula_trabajador = str(empleado.cedulaidentidad)
                        if orden_manual is not None:
                            numero_final = orden_manual
                        else:
                            hijo_menor = Employeefamily.objects.filter(
                                employeecedula=empleado,
                                cedulaFamiliar__startswith=f"{cedula_trabajador}-"
                            ).count()
                            numero_final = hijo_menor + 1
                        
                        nueva_cedula = f"{cedula_trabajador}-{numero_final}"
                        check_exists = Employeefamily.objects.filter(employeecedula=empleado, cedulaFamiliar=nueva_cedula)
                        if self.instance:
                            check_exists = check_exists.exclude(pk=self.instance.pk)
                        
                        if check_exists.exists():
                            raise serializers.ValidationError("El trabajador ya tiene un hijo registrado con el orden ingresado")
                        
                        data['cedulaFamiliar'] = nueva_cedula
             
                if not es_hijo_menor:
                   raise serializers.ValidationError({
                    "cedulaFamiliar": "La cédula es obligatoria a menos que el familiar sea un HIJO (A) menor de 9 años."
                    })
        heredero = data.get('heredero', False)
        if heredero and empleado:
            queryset = Employeefamily.objects.filter(employeecedula=empleado, heredero=True)
            if self.instance:
                queryset = queryset.exclude(pk=self.instance.pk)
            if queryset.exists():
                raise serializers.ValidationError("Este trabajador ya posee un familiar registrado como heredero")
        
        return data

    def create(self, validated_data):
        validated_data['employeecedula'] = self.context.get('empleado')
        
        validated_data.pop('orden_hijo', None)
        id_usuario = validated_data.pop('usuario_id')
        salud_data = validated_data.pop('perfil_salud_familiar', None)
        fisico_data = validated_data.pop('perfil_fisico_familiar', None)
        academico_data = validated_data.pop('formacion_academica_familiar', None)
        
        try:
            with transaction.atomic():
                instance = Employeefamily.objects.create(**validated_data)
                instance._history_user = id_usuario
                instance.save()

                if salud_data:
                    patologias = salud_data.pop('patologiaCronica', [])
                    discapacidades = salud_data.pop('discapacidad', [])
                    alergias = salud_data.pop('alergias', [])
                    s_obj = perfil_salud.objects.create(familiar_id=instance, **salud_data)
                    if patologias: s_obj.patologiaCronica.set(patologias)
                    if discapacidades: s_obj.discapacidad.set(discapacidades)
                    if alergias: s_obj.alergias.set(alergias)
                
                if fisico_data:
                    perfil_fisico.objects.create(familiar_id=instance, **fisico_data)
                
                if academico_data:
                    formacion_academica.objects.create(familiar_id=instance, **academico_data)
                    
                return instance
        except Exception as e:
            raise serializers.ValidationError(f"Error al guardar el registro familiar: {str(e)}")

    def update(self, instance, validated_data):
        validated_data.pop('orden_hijo', None)
        usuario = validated_data.pop('usuario_id', None)
        salud_data = validated_data.pop('perfil_salud_familiar', None)
        fisico_data = validated_data.pop('perfil_fisico_familiar', None)
        academico_data = validated_data.pop('formacion_academica_familiar', None)
        
        if usuario:
            instance._history_user = usuario

        with transaction.atomic():
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()
            if salud_data:
                patologias = salud_data.pop('patologiaCronica', None)
                discapacidades = salud_data.pop('discapacidad', None)
                alergias = salud_data.pop('alergias', None)
                s_obj, _ = perfil_salud.objects.update_or_create(familiar_id=instance, defaults=salud_data)
                if patologias is not None: s_obj.patologiaCronica.set(patologias)
                if discapacidades is not None: s_obj.discapacidad.set(discapacidades)
                if alergias is not None: s_obj.alergias.set(alergias)
            if fisico_data:
                perfil_fisico.objects.update_or_create(familiar_id=instance, defaults=fisico_data)
            if academico_data:
                formacion_academica.objects.update_or_create(familiar_id=instance, defaults=academico_data)
        return instance




    
class FamilyListSerializer(serializers.ModelSerializer):
    employeecedula = serializers.ReadOnlyField(source='employeecedula.cedulaidentidad')
    parentesco = ParentescoSerializer(read_only=True)
    sexo = SexoSerializer(read_only=True)
    estadoCivil = EstadoCivilSerializer(read_only=True)
    perfil_salud_familiar = serializers.SerializerMethodField()
    perfil_fisico_familiar = serializers.SerializerMethodField()
    formacion_academica_familiar = serializers.SerializerMethodField()

    class Meta:
        model = Employeefamily
        fields = [
            'id', 'employeecedula', 'cedulaFamiliar', 'primer_nombre', 'segundo_nombre', 
            'primer_apellido', 'segundo_apellido', 'parentesco', 
            'fechanacimiento', 'sexo', 'estadoCivil', 'mismo_ente', 
            'heredero', 'perfil_salud_familiar', 'perfil_fisico_familiar', 
            'formacion_academica_familiar', 'observaciones', 
            'createdat', 'updatedat'
        ]

    def get_perfil_salud_familiar(self, obj):
        instancia = obj.perfil_salud_set.first()
        return PerfilSaludSerializer(instancia).data if instancia else None

    def get_perfil_fisico_familiar(self, obj):
        instancia = obj.perfil_fisico_set.first()
        return PerfilFisicoSerializer(instancia).data if instancia else None

    def get_formacion_academica_familiar(self, obj):
        instancia = obj.formacion_academica_set.first()
        return FormacionAcademicaSerializer(instancia).data if instancia else None


class FamilyDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = FamilyDocument
        fields = ['id', 'document_type', 'file', 'uploaded_at']


class FamilyDocumentReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = FamilyDocument
        fields = ['id', 'document_type', 'file', 'uploaded_at']
   