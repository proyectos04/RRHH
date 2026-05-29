from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from rest_framework.exceptions import ValidationError
from rest_framework import status
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema

from AUTOGESTION.models.models_encuestas import PreguntasEncuestas
from AUTOGESTION.serializers.serializers_encuestas import (
    PreguntasEncuestasSerializer,
    CensoViviendaSubmitSerializer,
    ConsultarCensoSerializer,
)
from RAC.models.personal_models import Employee
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
