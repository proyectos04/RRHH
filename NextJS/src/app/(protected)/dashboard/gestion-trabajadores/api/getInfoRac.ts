"use server";
import {
  AcademyLevel,
  allergies,
  ApiResponse,
  BloodGroupType,
  Cargo,
  Carrera,
  Category,
  Code,
  ConditionDwelling,
  Coordination,
  Dependency,
  DirectionGeneral,
  DirectionLine,
  DisabilitysType,
  EmployeeCargoHistory,
  EmployeeData,
  EmployeeInfo,
  ErrorFetch,
  Family,
  Grado,
  MaritalStatusType,
  Mencion,
  Motion,
  Municipality,
  Nomina,
  NominaGeneral,
  OrganismosAds,
  PantsSize,
  ParentType,
  Parish,
  PatologysType,
  Region,
  ReportConfig,
  ReportStatus,
  ReportTypeNomina,
  ReportTypePerson,
  Sex,
  ShirtSize,
  ShoesSize,
  States,
  Status,
  TipoComision,
} from "@/app/types/types";

export const getAcademyLevel = async (): Promise<
  ApiResponse<AcademyLevel[]>
> => {
  const academyLevel = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}listar-nivel-academico`,
  );
  const responseAcademyLevel: ApiResponse<AcademyLevel[]> =
    await academyLevel.json();

  return responseAcademyLevel;
};
export const getStatus = async (): Promise<ApiResponse<Status[]>> => {
  const status = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}listar-estatus/`,
  );
  const responseStatus: ApiResponse<Status[]> = await status.json();
  return responseStatus;
};
export const imageProfileFn = async (id: string) => {
  const profileImg = await fetch(
    `${process.env.NEXT_PUBLIC_NEST_API_URL_SERVER}read-file/profile/${id}`,
  );
  const getProfile = await profileImg.blob();
  return getProfile;
};
export const getStatusNomina = async (): Promise<ApiResponse<Status[]>> => {
  const status = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}estatus-gestion/`,
  );
  const responseStatus: ApiResponse<Status[]> = await status.json();
  return responseStatus;
};
export const getStatusReport = async (): Promise<ApiResponse<Status[]>> => {
  const status = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}estatus/reports/`,
  );
  const responseStatus: ApiResponse<Status[]> = await status.json();
  return responseStatus;
};
export const getStatusEmployee = async (): Promise<ApiResponse<Status[]>> => {
  const statusEmployee = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}estatus/`,
  );
  const responseStatusEmployee: ApiResponse<Status[]> =
    await statusEmployee.json();
  return responseStatusEmployee;
};
export const getGrado = async (): Promise<ApiResponse<Grado[]>> => {
  const grado = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}listar-grado/`,
  );
  const responseGrado: ApiResponse<Grado[]> = await grado.json();
  return responseGrado;
};

export const getOrganismosAds = async (): Promise<
  ApiResponse<OrganismosAds[]>
> => {
  const organismosAdscritos = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}organismos-adscritos/`,
  );
  const responseOrganismosAdscritos: ApiResponse<OrganismosAds[]> =
    await organismosAdscritos.json();
  return responseOrganismosAdscritos;
};
export const getOrganismosAdsFather = async (): Promise<
  ApiResponse<OrganismosAds[]>
> => {
  const organismosAdscritos = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}organismos-adscritos/padre/`,
  );
  const responseOrganismosAdscritos: ApiResponse<OrganismosAds[]> =
    await organismosAdscritos.json();
  return responseOrganismosAdscritos;
};
export const getNomina = async (): Promise<ApiResponse<Nomina[]>> => {
  const nomina = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}listar-tipo-nomina/`,
  );
  const responseNomina: ApiResponse<Nomina[]> = await nomina.json();
  return responseNomina;
};
export const getNominaEspecial = async (): Promise<ApiResponse<Nomina[]>> => {
  const nomina = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}listar-nomina-especial/`,
  );
  const responseNomina: ApiResponse<Nomina[]> = await nomina.json();
  return responseNomina;
};

export const getNominaPasivo = async (): Promise<ApiResponse<Nomina[]>> => {
  const nomina = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}listar-nominaPasivo/`,
  );
  const responseNomina: ApiResponse<Nomina[]> = await nomina.json();
  return responseNomina;
};
export const getCargo = async (): Promise<ApiResponse<Cargo[]>> => {
  const cargo = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}listar-denominacion-cargo/`,
  );
  const responseCargo: ApiResponse<Cargo[]> = await cargo.json();
  return responseCargo;
};
export const getCargoEspecifico = async (): Promise<ApiResponse<Cargo[]>> => {
  const cargoEspecifico = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}listar-denominacion-cargo-especifico/`,
  );
  const responseCargoEspecifico: ApiResponse<Cargo[]> =
    await cargoEspecifico.json();
  return responseCargoEspecifico;
};
export const getStates = async (): Promise<ApiResponse<States[]>> => {
  const states = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}direccion/estados/`,
  );
  const responseStates: ApiResponse<States[]> = await states.json();
  return responseStates;
};
export const getMunicipalitys = async (
  id: string,
): Promise<ApiResponse<Municipality[]>> => {
  const responseMunicipalitys = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}direccion/municipios/${id}/`,
  );
  const getMunicipalitys: ApiResponse<Municipality[]> =
    await responseMunicipalitys.json();
  return getMunicipalitys;
};

export const getParish = async (id: string): Promise<ApiResponse<Parish[]>> => {
  const responseParish = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}direccion/parroquias/${id}/`,
  );
  const getParish: ApiResponse<Parish[]> = await responseParish.json();
  return getParish;
};

export const getCodigo = async (): Promise<
  ApiResponse<Code[] | ErrorFetch>
> => {
  const responseCode = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}listar-codigos/`,
  );
  const getCode: ApiResponse<Code[]> = await responseCode.json();
  return getCode;
};

export const getEmployeeById = async (
  id: string,
): Promise<ApiResponse<EmployeeData>> => {
  const responseEmployee = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}empleados-cedula/${id}/`,
  );
  const getEmployee: ApiResponse<EmployeeData> = await responseEmployee.json();
  return getEmployee;
};
export const getPasiveById = async (
  id: string,
): Promise<ApiResponse<EmployeeData>> => {
  const responseEmployee = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}employee/pasivo/${id}/`,
  );
  const getEmployee: ApiResponse<EmployeeData> = await responseEmployee.json();
  return getEmployee;
};
export const getEmployeeData = async (): Promise<
  ApiResponse<EmployeeData[]>
> => {
  const responseEmployee = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}Employee/cargos/`,
  );
  const getEmployee: ApiResponse<EmployeeData[]> =
    await responseEmployee.json();
  return getEmployee;
};
export const getEmployeeDataSearch = async ({
  searchParams,
}: {
  searchParams: string | undefined;
}): Promise<ApiResponse<EmployeeData[]>> => {
  const url =
    searchParams &&
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}Employee/cargos/?${searchParams}`;
  const responseEmployee = await fetch(`${url}`, {
    cache: "no-cache",
  });
  const getEmployee: ApiResponse<EmployeeData[]> =
    await responseEmployee.json();
  return getEmployee;
};
export const getHistoryMoveEmploye = async (
  id: string,
): Promise<ApiResponse<EmployeeCargoHistory[]>> => {
  const responseHistoryMoveEmploye = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}EmployeeMovementHistory/${id}/`,
  );
  const getHistoryMoveEmploye: ApiResponse<EmployeeCargoHistory[]> =
    await responseHistoryMoveEmploye.json();
  return getHistoryMoveEmploye;
};

export const getCodeList = async (): Promise<ApiResponse<Code[]>> => {
  const responseCodeList = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}codigos_lister/`,
  );
  const getCodeList: ApiResponse<Code[]> = await responseCodeList.json();
  return getCodeList;
};
export const getCodeListSearch = async ({
  searchParams,
}: {
  searchParams: string | undefined;
}): Promise<ApiResponse<Code[]>> => {
  if (!searchParams || searchParams === "") {
    return {
      status: "error",
      message: "",
      data: [],
    };
  }
  const responseCodeList = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}cargos/general/?${searchParams}`,
  );
  const getCodeList: ApiResponse<Code[]> = await responseCodeList.json();
  return getCodeList;
};

export const getCodeListSearchFree = async ({
  searchParams,
}: {
  searchParams: string | undefined;
}): Promise<ApiResponse<Code[]>> => {
  const responseCodeList = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}cargos/vacantes/?${searchParams}`,
  );
  const getCodeList: ApiResponse<Code[]> = await responseCodeList.json();
  return getCodeList;
};
export const getReportTypePerson = async (): Promise<
  ApiResponse<ReportTypePerson[]>
> => {
  const responseReportTypePerson = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}reporte-personal/`,
  );
  const getReportTypePerson: ApiResponse<ReportTypePerson[]> =
    await responseReportTypePerson.json();
  return getReportTypePerson;
};
export const getReportStatus = async (): Promise<
  ApiResponse<ReportStatus[]>
> => {
  const responseReportStatus = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}estatus/reportes/`,
  );
  const getReportStatus: ApiResponse<ReportStatus[]> =
    await responseReportStatus.json();
  return getReportStatus;
};

export const getReportTypeNomina = async (): Promise<
  ApiResponse<ReportTypeNomina[]>
> => {
  const responseReportTypeNomina = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}tiponomina/reportes/`,
  );
  const getReportTypeNomina: ApiResponse<ReportTypeNomina[]> =
    await responseReportTypeNomina.json();
  return getReportTypeNomina;
};
export const getBloodGroup = async (): Promise<
  ApiResponse<BloodGroupType[]>
> => {
  const responseBloodGroup = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}listar-grupoSanguineos/`,
  );
  const getBloodGroup: ApiResponse<BloodGroupType[]> =
    await responseBloodGroup.json();
  return getBloodGroup;
};

export const getPatologys = async (): Promise<ApiResponse<PatologysType[]>> => {
  const responsePatologys = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}Patologias/`,
  );
  const getPatologys: ApiResponse<PatologysType[]> =
    await responsePatologys.json();
  return getPatologys;
};

export const getDisability = async (): Promise<
  ApiResponse<DisabilitysType[]>
> => {
  const responseDisability = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}Discapacidades/`,
  );
  const getDisability: ApiResponse<DisabilitysType[]> =
    await responseDisability.json();
  return getDisability;
};

export const getCategory = async (
  type: "discapacidad" | "alergias" | "patologias",
) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}${type}/categorias`,
  );
  const getDisability: ApiResponse<Category[]> = await response.json();
  return getDisability;
};
export const getAllergies = async (): Promise<ApiResponse<allergies[]>> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}alergias/`,
  );
  const getResponse: ApiResponse<allergies[]> = await response.json();
  return getResponse;
};
export const getShirtSize = async (): Promise<ApiResponse<ShirtSize[]>> => {
  const responseShirtSize = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}listar-tallasCamisas/`,
  );
  const getShirtSize: ApiResponse<ShirtSize[]> = await responseShirtSize.json();
  return getShirtSize;
};

export const getPantsSize = async (): Promise<ApiResponse<PantsSize[]>> => {
  const responsePantsSize = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}listar-tallaPantalones/`,
  );
  const getPantsSize: ApiResponse<PantsSize[]> = await responsePantsSize.json();
  return getPantsSize;
};

export const getShoesSize = async (): Promise<ApiResponse<ShoesSize[]>> => {
  const responseShoesSize = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}listar-tallaZapatos/`,
  );
  const getShoesSize: ApiResponse<ShoesSize[]> = await responseShoesSize.json();
  return getShoesSize;
};

export const getMaritalstatus = async (): Promise<
  ApiResponse<MaritalStatusType[]>
> => {
  const responseMaritalstatus = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}listar-estadoCivil/`,
  );
  const getMaritalstatus: ApiResponse<MaritalStatusType[]> =
    await responseMaritalstatus.json();
  return getMaritalstatus;
};

export const getParent = async (): Promise<ApiResponse<ParentType[]>> => {
  const responseParent = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}Parentesco/`,
  );
  const getParent: ApiResponse<ParentType[]> = await responseParent.json();
  return getParent;
};

export const getDirectionGeneral = async (): Promise<
  ApiResponse<DirectionGeneral[]>
> => {
  const responseDirectionGeneral = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}listar-DireccionGeneral/`,
  );
  const getDirectionGeneral: ApiResponse<DirectionGeneral[]> =
    await responseDirectionGeneral.json();
  return getDirectionGeneral;
};

export const getDirectionLine = async (
  id: string,
): Promise<ApiResponse<DirectionLine[]>> => {
  const responseDirectionLine = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}listar-DireccionLinea/${id}/`,
  );
  const getDirectionLine: ApiResponse<DirectionLine[]> =
    await responseDirectionLine.json();
  return getDirectionLine;
};

export const getCoordination = async (
  id: string,
): Promise<ApiResponse<Coordination[]>> => {
  const responseCoordination = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}listar-Coordinacion/${id}/`,
  );
  const getCoordination: ApiResponse<Coordination[]> =
    await responseCoordination.json();
  return getCoordination;
};

export const getEmployeeInfo = async (
  id: string,
): Promise<ApiResponse<EmployeeInfo>> => {
  const responseEmployee = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}listar-data-empleados/${id}/`,
  );
  const getEmployee: ApiResponse<EmployeeInfo> = await responseEmployee.json();
  return getEmployee;
};

export const getCodeByDirectionGeneral = async (
  id: string,
): Promise<ApiResponse<Code[]>> => {
  const responseCode = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}cargo_DreccionGeneral/${id}/`,
  );
  const getEmployee: ApiResponse<Code[]> = await responseCode.json();
  return getEmployee;
};
export const getCodeByDirectionGeneralAll = async (
  id: string,
): Promise<ApiResponse<Code[]>> => {
  const responseCode = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}cargos/Direccion_general/${id}/`,
  );
  const getEmployee: ApiResponse<Code[]> = await responseCode.json();
  return getEmployee;
};

export const getCodeByDirectionLine = async (
  id: string,
): Promise<ApiResponse<Code[]>> => {
  const responseCode = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}cargo_DreccionLinea/${id}/`,
  );
  const getEmployee: ApiResponse<Code[]> = await responseCode.json();
  return getEmployee;
};
export const getCodeByDirectionLineAll = async (
  id: string,
): Promise<ApiResponse<Code[]>> => {
  const responseCode = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}cargos/Direccion_linea/${id}/`,
  );
  const getEmployee: ApiResponse<Code[]> = await responseCode.json();
  return getEmployee;
};
export const getCodeByCoordination = async (
  id: string,
): Promise<ApiResponse<Code[]>> => {
  const responseCode = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}cargo_coordinacion/${id}/`,
  );
  const getEmployee: ApiResponse<Code[]> = await responseCode.json();
  return getEmployee;
};
export const getCodeByCoordinationAll = async (
  id: string,
): Promise<ApiResponse<Code[]>> => {
  const responseCode = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}cargos/coordinacion/${id}/`,
  );
  const getEmployee: ApiResponse<Code[]> = await responseCode.json();
  return getEmployee;
};
export const getCarrera = async (): Promise<ApiResponse<Carrera[]>> => {
  const responseCarrera = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}carreras/`,
  );
  const getEmployee: ApiResponse<Carrera[]> = await responseCarrera.json();
  return getEmployee;
};

export const getMencion = async (
  id: string,
): Promise<ApiResponse<Mencion[]>> => {
  const responseMencion = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}Menciones/${id}/`,
  );
  const getEmployee: ApiResponse<Mencion[]> = await responseMencion.json();
  return getEmployee;
};
export const getConditionDwelling = async (): Promise<
  ApiResponse<ConditionDwelling[]>
> => {
  const responseConditionDwelling = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}condicion_vivienda/`,
  );
  const getDewlling: ApiResponse<ConditionDwelling[]> =
    await responseConditionDwelling.json();
  return getDewlling;
};

export const getSex = async (): Promise<ApiResponse<Sex[]>> => {
  const responseSex = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}listar-sexo/`,
  );
  const getSex: ApiResponse<Sex[]> = await responseSex.json();
  return getSex;
};

export const getReasonLeaving = async (): Promise<ApiResponse<Motion[]>> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}motivos/egreso/`,
  );
  const getResponse: ApiResponse<Motion[]> = await response.json();
  return getResponse;
};
export const getReasonLeavingPasive = async (): Promise<
  ApiResponse<Motion[]>
> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}motivos/egreso/fallecimineto/`,
  );
  const getResponse: ApiResponse<Motion[]> = await response.json();
  return getResponse;
};
export const getInternalReason = async (): Promise<ApiResponse<Motion[]>> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}motivos/estatus/`,
  );
  const getResponse: ApiResponse<Motion[]> = await response.json();
  return getResponse;
};
export const getMotionReason = async (): Promise<ApiResponse<Motion[]>> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}motivos/movimiento/`,
  );
  const getResponse: ApiResponse<Motion[]> = await response.json();
  return getResponse;
};
export const getReportConfigEmployee = async (): Promise<
  ApiResponse<ReportConfig>
> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}employee/reports/config/`,
  );
  const getResponse: ApiResponse<ReportConfig> = await response.json();
  return getResponse;
};
export const getReportConfigFamily = async (): Promise<
  ApiResponse<ReportConfig>
> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}family/reports/config/`,
  );
  const getResponse: ApiResponse<ReportConfig> = await response.json();
  return getResponse;
};
export const getReportConfigLeaving = async (): Promise<
  ApiResponse<ReportConfig>
> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}graduate/reports/config/`,
  );
  const getResponse: ApiResponse<ReportConfig> = await response.json();
  return getResponse;
};

export const getNominaGeneral = async (): Promise<
  ApiResponse<NominaGeneral[]>
> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}nomina/general/`,
  );
  const getResponse: ApiResponse<NominaGeneral[]> = await response.json();
  return getResponse;
};
export const getDependency = async (): Promise<ApiResponse<Dependency[]>> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}dependencias/`,
  );
  const getResponse: ApiResponse<Dependency[]> = await response.json();
  return getResponse;
};

export const postReport = async <T>(values: T): Promise<globalThis.Blob> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}reports/pdf/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    },
  );
  const getResponse = await response.blob();
  return getResponse;
};
export const postReportPasivo = async <T>(
  values: T,
): Promise<globalThis.Blob> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}reports/pasivo/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    },
  );
  const getResponse = await response.blob();
  return getResponse;
};
export const getRegion = async (): Promise<ApiResponse<Region[]>> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}direccion/regiones/`,
  );
  const getResponse: ApiResponse<Region[]> = await response.json();
  return getResponse;
};

export const getStateByRegion = async (
  id: number,
): Promise<ApiResponse<States[]>> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}direccion/estado/${id}/`,
  );
  const getResponse: ApiResponse<States[]> = await response.json();
  return getResponse;
};

export const getDirectionGeneralById = async (
  id: number | string,
): Promise<ApiResponse<DirectionGeneral[]>> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}direccionGeneral/${id}/`,
  );
  const getResponse: ApiResponse<DirectionGeneral[]> = await response.json();
  return getResponse;
};

export const getTiposComision = async (): Promise<
  ApiResponse<TipoComision[]>
> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}tiposComision/`,
  );
  const getResponse: ApiResponse<TipoComision[]> = await response.json();
  return getResponse;
};
export const getFamilyEmployee = async ({
  searchParams,
}: {
  searchParams: string | undefined;
}): Promise<ApiResponse<Family[]>> => {
  const url = searchParams
    ? `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}Employeefamily/?${searchParams}`
    : `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}Employeefamily/`;
  const response = await fetch(url);
  const getResponse: ApiResponse<Family[]> = await response.json();
  return getResponse;
};
