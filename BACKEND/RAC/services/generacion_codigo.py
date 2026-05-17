#generacion de codigo segun prefijo

from ..models.personal_models import AsigTrabajo

def generador_codigos(prefix):
    
    prefijo = len(prefix)
    
    
    ultima_asignacion = AsigTrabajo.objects.filter(
        codigo__startswith = prefix
    ).order_by('-codigo').first()
    
    
    
    if not ultima_asignacion:
        siguiente_numero = 1
    else:
        ultimo_codigo = ultima_asignacion.codigo
        
        try:
            ultimo_numero_base = int(ultimo_codigo[prefijo:])
            siguiente_numero = ultimo_numero_base + 1
            
        except (ValueError, IndexError):
            siguiente_numero = 1
    
    numero_formateado = str(siguiente_numero).zfill(4)
    
    return f"{prefix}{numero_formateado}"