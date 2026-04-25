// Funciones utilitarias para formateo automático de datos

// Función para capitalizar nombres y apellidos
export function capitalizarNombre(texto: string): string {
  if (!texto) return '';
  
  return texto
    .trim() // Eliminar espacios al inicio y final
    .toLowerCase() // Convertir todo a minúsculas
    .split(' ') // Dividir por espacios
    .map(palabra => {
      // Capitalizar primera letra de cada palabra
      if (palabra.length === 0) return '';
      return palabra.charAt(0).toUpperCase() + palabra.slice(1);
    })
    .join(' ') // Unir con espacios
    .replace(/\s+/g, ' '); // Eliminar espacios múltiples
}

// Función para limpiar y formatear texto general
export function limpiarTexto(texto: string): string {
  if (!texto) return '';
  
  return texto
    .trim() // Eliminar espacios al inicio y final
    .replace(/\s+/g, ' '); // Reemplazar múltiples espacios por uno solo
}

// Función para formatear DNI (eliminar espacios y caracteres especiales)
export function formatearDNI(dni: string): string {
  if (!dni) return '';
  
  return dni
    .trim()
    .replace(/[^\d]/g, ''); // Solo números
}

// Función para formatear teléfono
export function formatearTelefono(telefono: string): string {
  if (!telefono) return '';
  
  return telefono
    .trim()
    .replace(/\s+/g, ' '); // Normalizar espacios
}

// Función para formatear email (minúsculas y sin espacios)
export function formatearEmail(email: string): string {
  if (!email) return '';
  
  return email
    .trim()
    .toLowerCase(); // Email siempre en minúsculas
}

// Función para formatear medicamentos (capitalizar primera letra)
export function formatearMedicamento(medicamento: string): string {
  if (!medicamento) return '';
  
  const texto = medicamento.trim();
  if (texto.length === 0) return '';
  
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

// Función para formatear instituciones (capitalizar cada palabra)
export function formatearInstitucion(institucion: string): string {
  if (!institucion) return '';
  
  return institucion
    .trim()
    .split(' ')
    .map(palabra => {
      if (palabra.length === 0) return '';
      // Mantener algunas palabras en minúsculas (artículos, preposiciones)
      const palabrasMinusculas = ['de', 'del', 'la', 'las', 'el', 'los', 'y', 'e', 'o', 'u', 'en', 'con', 'por', 'para'];
      if (palabrasMinusculas.includes(palabra.toLowerCase())) {
        return palabra.toLowerCase();
      }
      return palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase();
    })
    .join(' ')
    .replace(/\s+/g, ' ');
}