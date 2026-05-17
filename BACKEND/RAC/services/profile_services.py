from ..models.personal_models import (
    datos_vivienda, perfil_salud, perfil_fisico,
    formacion_academica, formacion_complementaria,
    contacto_emergencia, antecedentes_servicio,
)


def upsert_vivienda(instance, data):
    if not data:
        return
    datos_vivienda.objects.update_or_create(empleado_id=instance, defaults=data)


def upsert_health_profile(instance, data, related_field="empleado_id"):
    if not data:
        return
    patologias = data.pop("patologiaCronica", None)
    discapacidades = data.pop("discapacidad", None)
    alergias = data.pop("alergias", None)
    kwargs = {related_field: instance}
    s_obj, _ = perfil_salud.objects.update_or_create(**kwargs, defaults=data)
    if patologias is not None:
        s_obj.patologiaCronica.set(patologias)
    if discapacidades is not None:
        s_obj.discapacidad.set(discapacidades)
    if alergias is not None:
        s_obj.alergias.set(alergias)


def create_health_profile(instance, data, related_field="familiar_id"):
    if not data:
        return
    patologias = data.pop("patologiaCronica", [])
    discapacidades = data.pop("discapacidad", [])
    alergias = data.pop("alergias", [])
    kwargs = {related_field: instance}
    s_obj = perfil_salud.objects.create(**kwargs, **data)
    if patologias:
        s_obj.patologiaCronica.set(patologias)
    if discapacidades:
        s_obj.discapacidad.set(discapacidades)
    if alergias:
        s_obj.alergias.set(alergias)


def upsert_physical_profile(instance, data, related_field="empleado_id"):
    if not data:
        return
    kwargs = {related_field: instance}
    perfil_fisico.objects.update_or_create(**kwargs, defaults=data)


def create_physical_profile(instance, data, related_field="familiar_id"):
    if not data:
        return
    kwargs = {related_field: instance}
    perfil_fisico.objects.create(**kwargs, **data)


def upsert_academic_profile(instance, data, related_field="empleado_id"):
    if not data:
        return
    kwargs = {related_field: instance}
    formacion_academica.objects.update_or_create(**kwargs, defaults=data)


def create_academic_profile(instance, data, related_field="familiar_id"):
    if not data:
        return
    kwargs = {related_field: instance}
    formacion_academica.objects.create(**kwargs, **data)


def replace_complementaria(instance, data_list):
    if data_list is None:
        return
    instance.formacion_complementaria_set.all().delete()
    for item in data_list:
        formacion_complementaria.objects.create(empleado_id=instance, **item)


def replace_contacto_emergencia(instance, data_list):
    if data_list is None:
        return
    contacto_emergencia.objects.filter(empleado_id=instance).delete()
    for item in data_list:
        contacto_emergencia.objects.create(empleado_id=instance, **item)


def replace_antecedentes(instance, data_list):
    if data_list is None:
        return
    instance.antecedentes_servicio_set.all().delete()
    for item in data_list:
        antecedentes_servicio.objects.create(empleado_id=instance, **item)
