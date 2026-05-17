from rest_framework import serializers

from django.db import transaction
from django.core.exceptions import ObjectDoesNotExist
from django.utils import timezone

from ..models.historial_personal_models import *

from ..models.personal_models import *
from ..serializers.catalogs_serializers import *

from USER.models.user_models import cuenta as User

from ..services.constants_historial import *

from ..services.constants import *

from RAC.serializers.personal_activo_serializers import *
from ..services.generacion_codigo import generador_codigos




class TipoMovimientoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tipo_movimiento
        fields = [
            "id",
            "movimiento"
        ]
        

class MovimintoCargoSerializer(serializers.Serializer):
    nuevo_cargo_id = serializers.PrimaryKeyRelatedField(queryset=AsigTrabajo.objects.all())
    usuario_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    motivo = serializers.PrimaryKeyRelatedField(queryset=Tipo_movimiento.objects.all())

    def validate_nuevo_cargo_id(self, value):
     
        try:
            estatus_vacante = Estatus.objects.get(estatus__iexact=ESTATUS_VACANTE)
        except Estatus.DoesNotExist:
            raise serializers.ValidationError("No existe el estatus 'VACANTE'")

        if value.estatusid != estatus_vacante:
            raise serializers.ValidationError("El cargo seleccionado ya está ocupado")
        
        return value
 

    @transaction.atomic
    def update(self, instance, validated_data):
        puesto_nuevo = validated_data['nuevo_cargo_id']
        usuario = validated_data['usuario_id']
        motivo = validated_data['motivo']
        empleado = instance.employee

        try:
            estatus_vacante = Estatus.objects.get(estatus__iexact=ESTATUS_VACANTE)
            estatus_activo = Estatus.objects.get(estatus__iexact=ESTATUS_ACTIVO)
        except Estatus.DoesNotExist:
            raise serializers.ValidationError("Error de datos de estatus")

        # LIBERAR CARGO ACTUAL
        instance.employee = None
        instance.estatusid = estatus_vacante
        instance.save()

        # OCUPAR NUEVO PUESTO
        puesto_nuevo.employee = empleado
        puesto_nuevo.estatusid = estatus_activo
        puesto_nuevo.observaciones = motivo.movimiento
        puesto_nuevo.save()

        #REGISTRO EN EL HISTORIAL
        registrar_historial_movimiento(
            empleado=empleado,
            puesto=puesto_nuevo, 
            tipo_movimiento='TRASLADO',
            motivo=motivo,
            usuario=usuario
        )

        return puesto_nuevo



# SERIALIZER BASE PARA LA GESTION DE LOS ESTATUS 
class BaseActionInputSerializer(serializers.Serializer):
    estatus_id = serializers.PrimaryKeyRelatedField(
        queryset=Estatus.objects.all(),
        source='estatus' 
    )
    usuario_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='usuario' 
    )


# SERILIZER PARA GESTIONAR CAMBIO DE ESTATUS 
class GestionStatusSerializer(BaseActionInputSerializer):
    motivo = serializers.PrimaryKeyRelatedField(queryset=Tipo_movimiento.objects.all())

    def validate_estatus_id(self, value):
 
        if value.estatus.upper() not in ESTATUS_PERMITIDOS:
            raise serializers.ValidationError("Gestión de estatus no permitido")
        return value

    @transaction.atomic
    def update(self, instance, validated_data):
        nuevo_estatus = validated_data['estatus'] 
        usuario = validated_data['usuario']
        motivo = validated_data['motivo']
        empleado = instance.employee

        instance.estatusid = nuevo_estatus
        instance.observaciones = motivo.movimiento
        instance.save()

        registrar_historial_movimiento(
            empleado=empleado,
            puesto=instance,
            tipo_movimiento='CAMBIO DE ESTATUS',
            motivo= motivo,
            usuario=usuario
        )

        return instance

# SERIALIZER PARA GESTIONAR EGRESOS Y PERSONAL PASIVO 
class SobrevivienteItemSerializer(serializers.Serializer):
    cedula_familiar = serializers.CharField(
        help_text="Cédula del familiar que recibirá la pensión",
        required=True
    )
    codigo = serializers.CharField(
        help_text="Código para el nuevo puesto del pensionado sobreviviente",
        required=False,
        max_length=50,
        allow_blank=True,
        allow_null=True
    )

class GestionEgreso_PasivoSerializer(BaseActionInputSerializer):
    motivo = serializers.PrimaryKeyRelatedField(queryset=Tipo_movimiento.objects.all())
    tiponominaid = serializers.IntegerField(required=False, allow_null=True)
    codigo_nuevo = serializers.CharField(required=False, max_length=50, allow_blank=True, allow_null=True)
    liberar_activos = serializers.BooleanField(required=False, default=False)
    
    # Nuevo campo para la lista de sobrevivientes
    sobrevivientes = SobrevivienteItemSerializer(many=True, required=False)

    @staticmethod
    def _generar_codigo_para_nomina(tipo_nomina):
        stop_words = {'DE', 'LA', 'EL', 'Y', 'LOS', 'LAS', 'EN', 'PARA'}
        nombre_nomina = tipo_nomina.nomina.upper()
        palabras = [w for w in nombre_nomina.split() if w not in stop_words]
        if not palabras:
            raise serializers.ValidationError("No se pudo generar un prefijo desde el nombre de la nómina.")
        prefix = "".join([w[0] for w in palabras]) + "_"
        return generador_codigos(prefix)

    def validate(self, data):
        estatus_obj = data['estatus']
        estatus_nombre = estatus_obj.estatus.upper()

        if estatus_nombre not in ESTATUS_PERMITIDOS_EGRESOS:
            raise serializers.ValidationError("Tipo de estatus no permitido")

        # --- LÓGICA PARA PASIVO (con autogeneración de código) ---
        if estatus_nombre == "PASIVO":
            if not data.get('tiponominaid'):
                raise serializers.ValidationError({'tiponominaid': "Es obligatorio asignar una nomina para personal PASIVO"})
            
            codigo = data.get('codigo_nuevo')
            if codigo:
                if AsigTrabajo.objects.filter(codigo=codigo).exists():
                    raise serializers.ValidationError({'codigo_nuevo': "Este codigo de puesto ya esta en uso"})
            else:
                tipo_nomina = Tiponomina.objects.get(id=data['tiponominaid'])
                data['codigo_nuevo'] = self._generar_codigo_para_nomina(tipo_nomina)

        # --- LÓGICA DE VALIDACIÓN PARA SOBREVIVIENTES ---
        sobrevivientes_input = data.get('sobrevivientes')
        if sobrevivientes_input:
            if estatus_nombre != "EGRESADO":
                raise serializers.ValidationError("La carga de sobrevivientes solo es permitida para estatus EGRESADO.")

            try:
                nomina_pension = Tiponomina.objects.get(nomina__iexact="PENSIONADO SOBREVIVIENTE")
            except ObjectDoesNotExist:
                raise serializers.ValidationError("El tipo de nómina 'PENSIONADO SOBREVIVIENTE' no está configurado.")

            # Generar prefijo para autogeneración de códigos de sobrevivientes
            stop_words = {'DE', 'LA', 'EL', 'Y', 'LOS', 'LAS', 'EN', 'PARA'}
            nombre_nomina_pension = nomina_pension.nomina.upper()
            palabras_pension = [w for w in nombre_nomina_pension.split() if w not in stop_words]
            if not palabras_pension:
                raise serializers.ValidationError("No se pudo generar un prefijo para la nómina de sobrevivientes.")
            prefix_pension = "".join([w[0] for w in palabras_pension]) + "_"

            # Calcular el siguiente número disponible para esta nómina
            ultima_pension = AsigTrabajo.objects.filter(
                codigo__startswith=prefix_pension
            ).order_by('-codigo').first()
            if not ultima_pension:
                sig_num_pension = 1
            else:
                try:
                    sig_num_pension = int(ultima_pension.codigo[len(prefix_pension):]) + 1
                except (ValueError, IndexError):
                    sig_num_pension = 1

            codigos_ingresados = []
            familiares_validados = []

            for item in sobrevivientes_input:
                ced_fam = item['cedula_familiar']
                cod_nuevo = item.get('codigo')

                if not cod_nuevo:
                    cod_nuevo = f"{prefix_pension}{str(sig_num_pension).zfill(4)}"
                    sig_num_pension += 1

                familiar = Employeefamily.objects.filter(cedulaFamiliar=ced_fam).first()
                if not familiar:
                    raise serializers.ValidationError(f"No se encontró familiar con la cédula {ced_fam}.")

                if Employee.objects.filter(cedulaidentidad=ced_fam).exists():
                    raise serializers.ValidationError(f"El familiar {ced_fam} ya es personal del sistema.")

                if cod_nuevo in codigos_ingresados:
                    raise serializers.ValidationError(f"Código {cod_nuevo} duplicado en la petición.")
                codigos_ingresados.append(cod_nuevo)

                if AsigTrabajo.objects.filter(codigo=cod_nuevo, tiponominaid=nomina_pension).exists():
                    raise serializers.ValidationError(f"El código {cod_nuevo} ya existe en la nómina de sobrevivientes.")

                familiares_validados.append({
                    'familiar_obj': familiar,
                    'empleado_origen': familiar.employeecedula, 
                    'codigo': cod_nuevo
                })

            # Inyectamos los datos validados para usarlos en el update
            data['nomina_pension_obj'] = nomina_pension
            data['familiares_validados_list'] = familiares_validados

        return data

    @transaction.atomic
    def update(self, instance, validated_data):
        usuario = validated_data['usuario']
        estatus_obj = validated_data['estatus']
        estatus_nombre = estatus_obj.estatus.upper()
        motivo = validated_data['motivo']
      
        try:
            estatus_vacante = Estatus.objects.get(estatus__iexact=ESTATUS_VACANTE)
        except Estatus.DoesNotExist:
            raise serializers.ValidationError("Estatus VACANTE no configurado")
      
        if estatus_nombre == "EGRESADO":
            # 1. Egresar al trabajador titular
            self._procesar_egreso_total(instance, motivo, usuario, estatus_vacante)
            
            # 2. Procesar sobrevivientes si existen
            familiares = validated_data.get('familiares_validados_list')
            if familiares:
                nomina = validated_data.get('nomina_pension_obj')
                self._ejecutar_creacion_sobrevivientes(familiares, nomina, usuario)
                
            return instance

        if estatus_nombre == "PASIVO":
            return self._procesar_pasivo(instance, validated_data, motivo, usuario, estatus_vacante)

        return instance

    def _ejecutar_creacion_sobrevivientes(self, familiares_validados, nomina_pension, usuario):
    
        try:
            estatus_activo = Estatus.objects.get(estatus__iexact="ACTIVO")
            tipo_pasivo = Tipo_personal.objects.get(tipo_personal__iexact="PASIVO")
            dependencia = Dependencias.objects.get(dependencia__iexact="NIVEL DE APOYO")
            dg_humana = DireccionGeneral.objects.get(direccion_general__iexact="OFICINA DE GESTION HUMANA")
            denom_pasivo = Denominacioncargo.objects.get(cargo__iexact="PERSONAL PASIVO")
            espec_pasivo = Denominacioncargoespecifico.objects.get(cargo__iexact="PERSONAL PASIVO")
            motivo_ingreso = Tipo_movimiento.objects.get(movimiento__iexact="PENSION POR SOBREVIVIENTE")
        except ObjectDoesNotExist as e:
            raise serializers.ValidationError(f"Error de configuración: {str(e)}")

        for item in familiares_validados:
            fam = item['familiar_obj']
            emp_origen = item['empleado_origen']
            codigo = item['codigo']

            # Crear el registro de Empleado para el familiar
            nuevo_emp = Employee.objects.create(
                cedulaidentidad=fam.cedulaFamiliar,
                nombres=f"{fam.primer_nombre or ''} {fam.segundo_nombre or ''}".strip(),
                apellidos=f"{fam.primer_apellido or ''} {fam.segundo_apellido or ''}".strip(),
                fecha_nacimiento=fam.fechanacimiento,
                sexoid=fam.sexo,
                estadoCivil=fam.estadoCivil,
                fechaingresoorganismo=timezone.now().date(),
            )
            nuevo_emp.save()

            # Migración de Perfil Salud
            salud = perfil_salud.objects.filter(familiar_id=fam).first()
            if salud:
                n_salud = perfil_salud.objects.create(empleado_id=nuevo_emp, grupoSanguineo=salud.grupoSanguineo)
                n_salud.patologiaCronica.set(salud.patologiaCronica.all())
                n_salud.discapacidad.set(salud.discapacidad.all())
                n_salud.alergias.set(salud.alergias.all())

            # Migración de Perfil Físico
            fisico = perfil_fisico.objects.filter(familiar_id=fam).first()
            if fisico:
                perfil_fisico.objects.create(
                    empleado_id=nuevo_emp,
                    tallaCamisa=fisico.tallaCamisa,
                    tallaPantalon=fisico.tallaPantalon,
                    tallaZapatos=fisico.tallaZapatos
                )

            # Migración de Formación Académica
            acad = formacion_academica.objects.filter(familiar_id=fam).first()
            if acad:
                formacion_academica.objects.create(
                    empleado_id=nuevo_emp,
                    nivel_Academico_id=acad.nivel_Academico_id,
                    carrera_id=acad.carrera_id,
                    mencion_id=acad.mencion_id,
                    institucion=acad.institucion,
                    
                )

            # Crear Asignación de Trabajo (Cargo)
            asig = AsigTrabajo.objects.create(
                employee=nuevo_emp,
                codigo=codigo,
                denominacioncargoid=denom_pasivo,
                denominacioncargoespecificoid=espec_pasivo,
                tiponominaid=nomina_pension,
                estatusid=estatus_activo,
                Tipo_personal=tipo_pasivo,
                Dependencia=dependencia,
                DireccionGeneral=dg_humana,
                observaciones=f"Pensión sobreviviente derivada de C.I. {emp_origen.cedulaidentidad}"
            )
            asig.save()

            registrar_historial_movimiento(nuevo_emp, asig, 'INGRESO', motivo_ingreso, usuario)

    # --- TUS MÉTODOS ORIGINALES SIN CAMBIOS ---
    def _procesar_pasivo(self, empleado, validated_data, motivo_obj, usuario, estatus_vacante):
        try:
            dg_humana = DireccionGeneral.objects.get(direccion_general__iexact="OFICINA DE GESTION HUMANA")
            dl_humana = DireccionLinea.objects.filter(direccionGeneral=dg_humana).first()
        except DireccionGeneral.DoesNotExist:
            raise serializers.ValidationError("OFICINA DE GESTION HUMANA no encontrada")

        ultima_asig = AsigTrabajo.objects.filter(employee=empleado).first()
        if not ultima_asig:
            raise serializers.ValidationError("El empleado no tiene cargos previos para realizar el pase a pasivo.")

        if validated_data.get('liberar_activos', False):
            self._procesar_egreso_total(empleado, motivo_obj, usuario, estatus_vacante)

        try:
            estatus_activo = Estatus.objects.get(estatus__iexact="ACTIVO")
            tipo_pasivo = Tipo_personal.objects.get(tipo_personal__iexact=PERSONAL_PASIVO)
        except (Estatus.DoesNotExist, Tipo_personal.DoesNotExist):
            raise serializers.ValidationError(" Verifique estatus 'ACTIVO' y tipo personal 'PASIVO'")

        nueva_asig = AsigTrabajo.objects.create(
            employee=empleado,
            codigo=validated_data['codigo_nuevo'],
            denominacioncargoid=ultima_asig.denominacioncargoid,
            denominacioncargoespecificoid=ultima_asig.denominacioncargoespecificoid,
            tiponominaid_id=validated_data['tiponominaid'],
            estatusid=estatus_activo,
            Tipo_personal=tipo_pasivo,
            gradoid=None,
            Dependencia =  dg_humana.dependenciaId if dg_humana else Dependencias.objects.get(id=1),
            DireccionGeneral=dg_humana,
            DireccionLinea=None,
            Coordinacion=None,
            OrganismoAdscritoid=ultima_asig.OrganismoAdscritoid,
            observaciones=f"Cargo pasivo generado. {motivo_obj.movimiento}"
        )
        
      
        nueva_asig.save()

        registrar_historial_movimiento(empleado, nueva_asig, 'CAMBIO_NOMINA', motivo_obj, usuario)
        return empleado

    def _procesar_egreso_total(self, empleado, motivo, usuario, estatus_vacante):
        try:
            estatus_egresado = Estatus.objects.get(estatus__iexact="EGRESADO") 
        except Estatus.DoesNotExist:
            raise serializers.ValidationError("No se encontró el estatus EGRESADO en la base de datos.")
        
        fecha_hoy = timezone.now().date()
        asignaciones = AsigTrabajo.objects.filter(employee=empleado)
        
        antecedentes_servicio.objects.create(
            empleado_id=empleado,
            institucion="MPPRIJP", 
            fecha_ingreso=empleado.fechaingresoorganismo,
            fecha_egreso=fecha_hoy
        )
        egreso_obj = EmployeeEgresado.objects.create(
            employee=empleado,
            n_contrato=empleado.n_contrato, 
            fechaingresoorganismo=empleado.fechaingresoorganismo,
            motivo_egreso=motivo
        )

        for asig in asignaciones:
            CargoEgresado.objects.create(
                egreso=egreso_obj,
                codigo=asig.codigo,
                denominacioncargoid=asig.denominacioncargoid,
                denominacioncargoespecificoid=asig.denominacioncargoespecificoid,
                gradoid=asig.gradoid,
                tiponominaid=asig.tiponominaid,
                TipoPersonalId= asig.Tipo_personal,
                Dependencia = asig.Dependencia,
                DireccionGeneral=asig.DireccionGeneral,
                DireccionLinea=asig.DireccionLinea,
                Coordinacion=None,
                OrganismoAdscritoid=asig.OrganismoAdscritoid
            )
        
            asig.estatusid = estatus_egresado
            registrar_historial_movimiento(empleado, asig, 'EGRESO', motivo, usuario)
            
            asig.employee = None
            asig.save()
class CargoEgresadoSerializer(serializers.ModelSerializer):
    denominacioncargo = denominacionCargoSerializer(source='denominacioncargoid', read_only=True)
    denominacioncargoespecifico = denominacionCargoEspecificoSerializer(source='denominacioncargoespecificoid', read_only=True)
    grado = gradoSerializer(source='gradoid', read_only=True)
    tiponomina = TipoNominaSerializer(source='tiponominaid', read_only=True)
    DireccionGeneral = DireccionGeneralSerializer(read_only=True)
    DireccionLinea = DireccionLineaSerializer(read_only=True)
    Coordinacion = CoordinacionSerializer(read_only=True)
    OrganismoAdscrito = OrganismoAdscritoSerializer(source='OrganismoAdscritoid', read_only=True)

    class Meta:
        model = CargoEgresado
        fields = [
            'id',
            'codigo', 'denominacioncargo', 'denominacioncargoespecifico', 
            'grado', 'tiponomina', 'DireccionGeneral', 
            'DireccionLinea', 'Coordinacion', 'OrganismoAdscrito'
        ]
 

    
class TipoMovimientoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tipo_movimiento
        fields = ['id', 'movimiento']
    
    

        
class EmployeeCargoHistorySerializer(serializers.ModelSerializer):
    modificado_por_usuario = serializers.SerializerMethodField()
    cedula_analista = serializers.CharField(source='ejecutado_por.cedula.cedulaidentidad', read_only=True)
    motivo_movimiento = TipoMovimientoSerializer(source='motivo',read_only=True)
    new_estatus = EstatusSerializer(source='estatus',read_only=True)
    new_tipoPersonal = TipoPersonalSerializer(source='tipo_personal',read_only=True)
    new_denominacioncargo = denominacionCargoSerializer(source='denominacioncargo',read_only=True)
    new_denominacioncargoespecifico = denominacionCargoEspecificoSerializer(source='denominacioncargoespecifico',read_only=True)
    new_grado = gradoSerializer(source='gradoid',read_only=True)
    new_tiponomina = TipoNominaSerializer(source='tiponomina',read_only=True)
    new_Dependencia = DependenciaSerializer(source='DependenciasId',read_only=True)
    new_DireccionGeneral = DireccionGeneralSerializer(source='DireccionGeneralid',read_only=True)
    new_DireccionLinea = DireccionLineaSerializer(source='DireccionLineaid',read_only=True)
    new_Coordinacion= CoordinacionSerializer(source='Coordinacionid',read_only=True)

    class Meta:
        model = EmployeeMovementHistory
        fields = [
            'id', 'codigo_puesto', 'fecha_movimiento', 'modificado_por_usuario', 'cedula_analista',
            'motivo_movimiento','new_estatus','new_tipoPersonal',
            'new_denominacioncargo', 'new_denominacioncargoespecifico', 'new_grado', 
            'new_tiponomina','new_Dependencia' ,'new_DireccionGeneral', 'new_DireccionLinea', 'new_Coordinacion'
        ]
        
    def get_modificado_por_usuario(self, obj):
        try:
            empleado = obj.ejecutado_por.cedula
            return f"{empleado.nombres} {empleado.apellidos}".strip()
        except AttributeError:
            return "Analista no encontrado"

    def to_representation(self, instance):
        representation = super().to_representation(instance)

        prev = EmployeeMovementHistory.objects.filter(
            empleado=instance.empleado,
            fecha_movimiento__lt=instance.fecha_movimiento
        ).select_related(
            'denominacioncargo', 'denominacioncargoespecifico', 'gradoid',
            'tiponomina', 'DependenciasId','DireccionGeneralid', 'DireccionLineaid', 'Coordinacionid','estatus', 'tipo_personal'
        ).order_by('-fecha_movimiento').first()

        representation.update({
            'prev_estatus': EstatusSerializer(prev.estatus).data if prev else None,
            'prev_tipoPersonal': TipoPersonalSerializer(prev.tipo_personal).data if prev else None,
            'prev_denominacioncargo': denominacionCargoSerializer(prev.denominacioncargo).data if prev else None,
            'prev_denominacioncargoespecifico': denominacionCargoEspecificoSerializer(prev.denominacioncargoespecifico).data if prev else None,
            'prev_grado': gradoSerializer(prev.gradoid).data if prev and prev.gradoid else None,
            'prev_tiponomina': TipoNominaSerializer(prev.tiponomina).data if prev else None,
            'prev_Dependencia': DependenciaSerializer(prev.DependenciasId).data if prev and prev.DependenciasId else None,
            'prev_DireccionGeneral': DireccionGeneralSerializer(prev.DireccionGeneralid).data if prev and prev.DireccionGeneralid else None,
            'prev_DireccionLinea': DireccionLineaSerializer(prev.DireccionLineaid).data if prev and prev.DireccionLineaid else None,
            'prev_Coordinacion': CoordinacionSerializer(prev.Coordinacionid).data if prev and prev.Coordinacionid else None,
        })

        return representation