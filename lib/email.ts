import crypto from 'crypto';

// En modo desarrollo no usamos un transportador real: los emails se simulan en consola.
// Si deseas enviar emails reales, instala 'nodemailer' y sus tipos:
//   npm install nodemailer
//   npm install -D @types/nodemailer
// y reinstaura la configuración del transportador aquí.

// Función para simular envío de email (para desarrollo)
export async function enviarEmailVerificacion(
  email: string, 
  nombre: string, 
  token: string
) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const verificationUrl = `${baseUrl}/verificar-email?token=${token}`;

  // Para desarrollo, solo logueamos el email en lugar de enviarlo
  console.log('📧 EMAIL DE VERIFICACIÓN (SIMULADO):');
  console.log('='.repeat(50));
  console.log(`Para: ${email}`);
  console.log(`Nombre: ${nombre}`);
  console.log(`Token: ${token}`);
  console.log(`URL de verificación: ${verificationUrl}`);
  console.log('='.repeat(50));

  // Simular delay de envío
  await new Promise(resolve => setTimeout(resolve, 1000));

  // En desarrollo, siempre retornamos éxito
  return { 
    success: true, 
    messageId: `sim_${Date.now()}`,
    verificationUrl,
    message: 'Email simulado enviado correctamente (ver consola del servidor)'
  };
}

// Función para enviar email de cambio de contraseña
export async function enviarEmailCambioPassword(
  email: string, 
  nombre: string, 
  token: string
) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const resetUrl = `${baseUrl}/cambiar-password?token=${token}`;

  // Para desarrollo, solo logueamos el email
  console.log('📧 EMAIL DE CAMBIO DE CONTRASEÑA (SIMULADO):');
  console.log('='.repeat(50));
  console.log(`Para: ${email}`);
  console.log(`Nombre: ${nombre}`);
  console.log(`Token: ${token}`);
  console.log(`URL de cambio: ${resetUrl}`);
  console.log('='.repeat(50));

  await new Promise(resolve => setTimeout(resolve, 1000));

  return { 
    success: true, 
    messageId: `sim_${Date.now()}`,
    resetUrl,
    message: 'Email de cambio de contraseña simulado (ver consola del servidor)'
  };
}

// Función para generar token seguro
export function generarToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Función para verificar configuración de email
export async function verificarConfiguracionEmail() {
  // En desarrollo, siempre retornamos true
  console.log('✅ Configuración de email verificada (modo desarrollo)');
  return true;
}