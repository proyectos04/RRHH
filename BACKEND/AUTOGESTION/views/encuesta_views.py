from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny
from rest_framework import status
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema

from AUTOGESTION.models.models_encuestas import PreguntasEncuestas
from AUTOGESTION.serializers.serializers_encuestas import (
    PreguntasEncuestasSerializer,
    CensoViviendaSubmitSerializer,
    ConsultarCensoSerializer,
)
from AUTOGESTION.serializers.censo_excel_serializer import CensoExcelSerializer
from RAC.models.personal_models import Employee, AsigTrabajo
from RAC.utils.data_formatters import extract_first_error


@extend_schema(
    tags=["AUTOGESTION - Censo Vivienda"],
    summary="Listar preguntas activas del censo",
    description="Devuelve todas las preguntas activas ordenadas por el campo 'orden'.",
    request=PreguntasEncuestasSerializer,
)
@api_view(["GET"])
def listar_preguntas_censo(request):
    try:
        preguntas = PreguntasEncuestas.objects.filter(activo=True)
        serializer = PreguntasEncuestasSerializer(preguntas, many=True)
        return Response(
            {
                "status": "success",
                "message": "Preguntas obtenidas correctamente",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )
    except Exception as e:
        return Response(
            {
                "status": "error",
                "message": str(e),
                "data": [],
            },
            status=status.HTTP_400_BAD_REQUEST,
        )


@extend_schema(
    tags=["AUTOGESTION - Censo Vivienda"],
    summary="Registrar respuestas del censo de vivienda",
    description="Guarda las respuestas del censo y actualiza el Carnet de la Patria en el perfil del trabajador.",
    request=CensoViviendaSubmitSerializer,
)
@api_view(["POST"])
def registrar_censo_vivienda(request, cedula_empleado):
    empleado = get_object_or_404(Employee, cedulaidentidad=cedula_empleado)

    serializer = CensoViviendaSubmitSerializer(
        data=request.data,
        context={"empleado": empleado, "request": request},
    )

    try:
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {
                "status": "success",
                "message": "Censo de vivienda registrado correctamente",
                "data": serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )
    except ValidationError:
        clean_message = extract_first_error(serializer.errors)
        return Response(
            {
                "status": "error",
                "message": clean_message,
                "data": None,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )
    except Exception as e:
        return Response(
            {
                "status": "error",
                "message": str(e),
                "data": None,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )


@extend_schema(
    tags=["AUTOGESTION - Censo Vivienda"],
    summary="Consultar respuestas del censo",
    description="Devuelve las respuestas del censo de todos los trabajadores, con filtro opcional por cédula. Primeros 10 resultados.",
)
@api_view(["GET"])
def consultar_censo_empleado(request):
    cedula = request.GET.get("cedula", "")

    queryset = Employee.objects.prefetch_related(
        "assignments",
        "antecedentes_servicio_set",
        "datos_vivienda_set",
    )

    if cedula:
        queryset = queryset.filter(cedulaidentidad=cedula)

    empleados = queryset[:10]

    serializer = ConsultarCensoSerializer(empleados, many=True)

    return Response(
        {
            "status": "success",
            "message": "Resultados obtenidos correctamente",
            "data": serializer.data,
        },
        status=status.HTTP_200_OK,
    )


@extend_schema(
    tags=["AUTOGESTION - Censo Vivienda"],
    summary="Exportar censo a Excel",
    description="Genera un archivo XLSX con los datos del censo de vivienda de todos los trabajadores.",
)
@api_view(["GET"])
@permission_classes([AllowAny])
def exportar_censo_excel(request):
    try:
        import io
        import openpyxl
        from django.utils import timezone
        from django.http import HttpResponse
        from django.db.models import Prefetch

        filtro_asignaciones = AsigTrabajo.objects.select_related(
            "Dependencia", "DireccionGeneral", "tiponominaid",
            "denominacioncargoid",
        )
        empleados = Employee.objects.filter(
            respuestas_encuesta__isnull=False
        ).prefetch_related(
            Prefetch("assignments", queryset=filtro_asignaciones),
            "datos_vivienda_set",
        ).distinct()

        serializer = CensoExcelSerializer(empleados, many=True)
        datos = serializer.data

        preguntas = PreguntasEncuestas.objects.filter(activo=True).order_by("orden")
        preguntas_headers = [p.enunciado for p in preguntas]

        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Censo Vivienda"

        cabeceras = [
            "Cedula", "Nombres", "Apellidos", "Carnet_Patria",
            "Direccion", "Estado", "Municipio", "Parroquia", "Codigo_Postal",
            "Codigo", "Cargo", "Dependencia", "Gerencia",
            "Fecha_Ingreso", "Tipo_Nomina",
        ] + preguntas_headers
        ws.append(cabeceras)

        for item in datos:
            respuestas = item.get("Respuestas", {}) or {}
            row = [
                item.get("Cedula", ""),
                item.get("Nombres", ""),
                item.get("Apellidos", ""),
                item.get("Carnet_Patria", ""),
                item.get("Direccion", ""),
                item.get("Estado", ""),
                item.get("Municipio", ""),
                item.get("Parroquia", ""),
                item.get("Codigo_Postal", ""),
                item.get("Codigo", ""),
                item.get("Cargo", ""),
                item.get("Dependencia", ""),
                item.get("Gerencia", ""),
                item.get("Fecha_Ingreso", ""),
                item.get("Tipo_Nomina", ""),
            ]
            for p in preguntas_headers:
                row.append(respuestas.get(p, ""))
            ws.append(row)

        buffer = io.BytesIO()
        wb.save(buffer)
        buffer.seek(0)

        fecha_str = timezone.now().strftime("%d_%m_%Y")
        filename = f"censo_vivienda_{fecha_str}.xlsx"
        response = HttpResponse(
            buffer.getvalue(),
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )
        response["Content-Disposition"] = f'attachment; filename="{filename}"'
        return response

    except Exception as e:
        return Response(
            {
                "status": "error",
                "message": f"Error al generar el Excel: {str(e)}",
                "data": [],
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
