import logging
from rest_framework.exceptions import ValidationError
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from RAC.filters.filters_personal import CuentaFilter
from drf_spectacular.utils import extend_schema
from  USER.models import cuenta
from USER.serializers import *
logger = logging.getLogger(__name__)

@extend_schema(
    tags=["Gestion de Usuarios"],
    summary="Inicio de sesion",
    request=LoginSerializer, 
 
) 
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    try:
        serializer.is_valid(raise_exception=True)
        
        usuario = serializer.validated_data
        datos_usuario = CuentaSerializer(usuario).data
        
        return Response({
            'status': "success",
            'message': "Inicio de sesión exitoso",
            'data': datos_usuario
        }, status=status.HTTP_200_OK)
        
    except ValidationError:
        error_dict = serializer.errors
        first_error_field = list(error_dict.values())[0]
        clean_message = first_error_field[0] if isinstance(first_error_field, list) else first_error_field

        return Response({
            'status': "error",
            'message': clean_message,
            'data': None
        }, status=status.HTTP_401_UNAUTHORIZED) 

    except Exception as e:
        logger.error(f"Error en login: {str(e)}")
        return Response({
            'status': "error",
            'message': str(e),
            'data': None
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        
        
@extend_schema(
    tags=["Gestion de Usuarios"],
    summary="Registro de Usuario",
  request=RegisterSerializer, 
) 
@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    try:
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        nueva_cuenta = serializer.save()
        
        return Response({
            'status': "success",
            'message': 'Usuario registrado exitosamente',
            'data': CuentaSerializer(nueva_cuenta).data
        }, status=status.HTTP_201_CREATED)

    except ValidationError:
        error_dict = serializer.errors
        first_error_field = list(error_dict.values())[0]
        clean_message = first_error_field[0] if isinstance(first_error_field, list) else first_error_field

        return Response({
            'status': "error",
            'message': clean_message,
            
        }, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
       
        return Response({
            'status': "error",
            'message': 'Error interno del servidor al procesar el registro.',
            
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@extend_schema(
    tags=["Gestion de Usuarios"],
    summary="editar  Usuario",
  request=UpdateCuentaSerializer, 
) 
@api_view(['PATCH', 'PUT'])
def editar_usuario(request, id):
    try:
        usuario = cuenta.objects.get(id=id)
    except cuenta.DoesNotExist:
        return Response({
            'status': "error", 
            'message': 'El usuario no existe.',
            'data': None
        }, status=status.HTTP_404_NOT_FOUND)

    serializer = UpdateCuentaSerializer(usuario, data=request.data, partial=True)
    
    try:
        serializer.is_valid(raise_exception=True)
        usuario_actualizado = serializer.save()
        
        return Response({
            'status': "success",
            'message': 'Usuario actualizado exitosamente.',
            'data': CuentaSerializer(usuario_actualizado).data
        }, status=status.HTTP_200_OK)

    except ValidationError:
        error_dict = serializer.errors
        first_error_field = list(error_dict.values())[0]
        clean_message = first_error_field[0] if isinstance(first_error_field, list) else first_error_field

        return Response({
            'status': "error",
            'message': clean_message,
            'data': None
        }, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response({
            'status': "error",
            'message': f"Ocurrió un error inesperado: {str(e)}",
            'data': None
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@extend_schema(
    tags=["Gestion de Usuarios"],
    summary="Editar estatus de Usuario",
    request=CambiarEstadoCuentaSerializer, 
) 
@api_view(['PATCH'])
def cambiar_estado_usuario(request,id):
    try:
        usuario = cuenta.objects.get(id=id)
        serializer = CambiarEstadoCuentaSerializer(usuario, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        usuario_actualizado = serializer.save()
        estado_str = "activado" if usuario_actualizado.is_active else "suspendido"

        return Response({
            'status': 'success',
            'message': f'Usuario {estado_str} exitosamente.',
            'data': CuentaSerializer(usuario_actualizado).data
        }, status=status.HTTP_200_OK)
        
    except cuenta.DoesNotExist:
        return Response({
            'status': "error",
            'message': 'El usuario no existe.',
            'data': None
        }, status=status.HTTP_404_NOT_FOUND)
        
    except ValidationError:
        error_dict = serializer.errors
        first_error_value = list(error_dict.values())[0]
        clean_message = first_error_value[0] if isinstance(first_error_value, list) else first_error_value
        return Response({
            'status': "error",
            'message': clean_message, 
            'data': None
        }, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error al cambiar estado: {str(e)}")
        return Response({
            'status': "error",
            'message': "Error interno del servidor",
            'data': None
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        
@extend_schema(
    tags=["Gestion de Usuarios"],
    summary="Consulta de usuarios",
) 
@api_view(['GET'])
def usuarios_lista(request):
    try:
        queryset = cuenta.objects.select_related('cedula', 'departamento', 'rol').all()
        
        filterset = CuentaFilter(request.GET, queryset=queryset)
        
        if not filterset.is_valid():
            return Response({
                'status': "error",
                'message': "Los parámetros de filtro son inválidos.",
                'data': filterset.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        usuarios = filterset.qs[:10]
        
        serializer = CuentaSerializer(usuarios, many=True)
        
        return Response({
            'status': 'success',
            'message': 'Lista de usuarios obtenida correctamente',
            'data': serializer.data,
        
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error al listar usuarios: {str(e)}")
        return Response({
            'status': "error",
            'message': f"Error al listar: {str(e)}",
            'data': None
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        


@extend_schema(
    tags=["Gestion de Usuarios"],
    summary="Listar Departamentos",
    description="Devuelve una lista de todas las Depepartamentos disponibles.",

)
@api_view(['GET'])
def list_departaments(request):
    try:
        queryset = departaments.objects.all()
        serializer = DepartamentoSerializer(queryset, many=True)
        
        return Response({
            'status': "success",
            'message': "Departamentos listados correctamente",
            'data': serializer.data
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'status': "error",
            'message': "No se pudo recuperar la lista de Departamentos",
            'data': []
        }, status=status.HTTP_400_BAD_REQUEST)
        

@extend_schema(
    tags=["Gestion de Usuarios"],
    summary="Listar Roles",
    description="Devuelve una lista de todas los roles disponibles",
    responses=RolSerializer
)
@api_view(['GET'])
def list_rols(request):
    try:
        queryset = Rol.objects.all()
        serializer = RolSerializer(queryset, many=True)
        
        return Response({
            'status': "success",
            'message': "roles listados correctamente",
            'data': serializer.data
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'status': "error",
            'message': "No se pudo recuperar la lista de roles",
            'data': []
        }, status=status.HTTP_400_BAD_REQUEST)