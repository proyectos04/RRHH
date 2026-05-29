from rest_framework import serializers
from RAC.models.personal_models import Employee
from AUTOGESTION.models.models_encuestas import RespuestasEncuesta


class CensoExcelSerializer(serializers.ModelSerializer):
    Cedula = serializers.CharField(source="cedulaidentidad", read_only=True)
    Nombres = serializers.CharField(source="nombres", read_only=True)
    Apellidos = serializers.CharField(source="apellidos", read_only=True)
    Carnet_Patria = serializers.SerializerMethodField()
    Direccion = serializers.SerializerMethodField()
    Estado = serializers.SerializerMethodField()
    Municipio = serializers.SerializerMethodField()
    Parroquia = serializers.SerializerMethodField()
    Codigo_Postal = serializers.SerializerMethodField()
    Codigo = serializers.SerializerMethodField()
    Cargo = serializers.SerializerMethodField()
    Dependencia = serializers.SerializerMethodField()
    Gerencia = serializers.SerializerMethodField()
    Fecha_Ingreso = serializers.SerializerMethodField()
    Tipo_Nomina = serializers.SerializerMethodField()
    Respuestas = serializers.SerializerMethodField()

    class Meta:
        model = Employee
        fields = [
            "Cedula", "Nombres", "Apellidos", "Carnet_Patria",
            "Direccion", "Estado", "Municipio", "Parroquia", "Codigo_Postal",
            "Codigo", "Cargo", "Dependencia", "Gerencia",
            "Fecha_Ingreso", "Tipo_Nomina", "Respuestas",
        ]

    def _get_first_assignment(self, obj):
        asignaciones = obj.assignments.all()
        return asignaciones[0] if asignaciones else None

    def _get_vivienda(self, obj):
        return obj.datos_vivienda_set.first()

    def get_Carnet_Patria(self, obj):
        return obj.carnet_patria or ""

    def get_Direccion(self, obj):
        v = self._get_vivienda(obj)
        return v.direccion_exacta if v else ""

    def get_Estado(self, obj):
        v = self._get_vivienda(obj)
        return v.estado_id.estado if v and v.estado_id else ""

    def get_Municipio(self, obj):
        v = self._get_vivienda(obj)
        return v.municipio_id.municipio if v and v.municipio_id else ""

    def get_Parroquia(self, obj):
        v = self._get_vivienda(obj)
        return v.parroquia.parroquia if v and v.parroquia else ""

    def get_Codigo_Postal(self, obj):
        v = self._get_vivienda(obj)
        return v.codigo_postal if v else ""

    def get_Codigo(self, obj):
        a = self._get_first_assignment(obj)
        return a.codigo if a and a.codigo else ""

    def get_Cargo(self, obj):
        a = self._get_first_assignment(obj)
        if a and a.denominacioncargoid:
            return a.denominacioncargoid.cargo
        return ""

    def get_Dependencia(self, obj):
        a = self._get_first_assignment(obj)
        return a.Dependencia.dependencia if a and a.Dependencia else ""

    def get_Gerencia(self, obj):
        a = self._get_first_assignment(obj)
        return a.DireccionGeneral.direccion_general if a and a.DireccionGeneral else ""

    def get_Fecha_Ingreso(self, obj):
        from RAC.models.personal_models import contratos
        contrato = (
            contratos.objects.filter(antecedente_id__empleado_id=obj)
            .select_related("antecedente_id")
            .order_by("antecedente_id__fecha_ingreso")
            .first()
        )
        if contrato and contrato.antecedente_id:
            return contrato.antecedente_id.fecha_ingreso.strftime("%d/%m/%Y")
        return ""

    def get_Tipo_Nomina(self, obj):
        a = self._get_first_assignment(obj)
        return a.tiponominaid.nomina if a and a.tiponominaid else ""

    def get_Respuestas(self, obj):
        respuestas = RespuestasEncuesta.objects.filter(
            empleado=obj
        ).select_related("pregunta", "opcion").order_by("pregunta__orden")

        result = {}
        for r in respuestas:
            if r.opcion:
                result[r.pregunta.enunciado] = r.opcion.tipo_opcion
            elif r.respuesta:
                result[r.pregunta.enunciado] = r.respuesta
            else:
                result[r.pregunta.enunciado] = ""
        return result
