// Configuración de zona horaria automática del dispositivo

// Función para obtener fecha/hora actual del dispositivo en formato datetime-local
export function formatearDateTimeLocal(fecha?: Date): string {
  // Si no se proporciona fecha, usar la actual del dispositivo
  const fechaBase = fecha || new Date();
  
  // Usar la zona horaria local del dispositivo automáticamente
  const year = fechaBase.getFullYear();
  const month = String(fechaBase.getMonth() + 1).padStart(2, '0');
  const day = String(fechaBase.getDate()).padStart(2, '0');
  const hours = String(fechaBase.getHours()).padStart(2, '0');
  const minutes = String(fechaBase.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Función para mostrar fecha/hora usando zona horaria local del dispositivo
export function formatearFechaHoraLocal(fecha: Date | string): string {
  const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
  
  // Usar toLocaleString sin especificar zona horaria para usar la del dispositivo
  return fechaObj.toLocaleString(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

// Función para obtener solo la fecha usando zona horaria local del dispositivo
export function formatearFechaLocal(fecha: Date | string): string {
  const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
  
  return fechaObj.toLocaleDateString(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

// Función para obtener la hora actual del dispositivo (para usar en formularios)
export function obtenerHoraActualDispositivo(): string {
  const now = new Date();
  
  // Obtener la fecha/hora local del dispositivo
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Mantener funciones anteriores para compatibilidad
export function formatearFechaHoraArgentina(fecha: Date | string): string {
  return formatearFechaHoraLocal(fecha);
}

export function formatearFechaArgentina(fecha: Date | string): string {
  return formatearFechaLocal(fecha);
}