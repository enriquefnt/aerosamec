export interface ProcedimientoPayload {
  trasladoId: string;
  usuarioId: string;
  tipoRaw: string;
  descripcionRaw: string;
  observacionesRaw?: string;
  fechaHora: string;
}

export interface MedicacionPayload {
  trasladoId: string;
  usuarioId: string;
  medicamento: string;
  dosis: string;
  via: string;
  observaciones?: string;
  fechaHora: string;
}

export interface SignosPayload {
  trasladoId: string;
  usuarioId: string;
  frecuenciaCardiaca?: string;
  frecuenciaRespiratoria?: string;
  presionArterialSist?: string;
  presionArterialDiast?: string;
  temperatura?: string;
  saturacionO2?: string;
  escalaGlasgow?: string;
  observaciones?: string;
  fechaHora: string;
}

export interface EvaluacionInicialPayload {
  trasladoId: string;
  usuarioId: string;
  diagnostico: string;
  viaAerea: string;
  respiracion: string;
  hemodinamia: string;
  neurologico: string;
}
