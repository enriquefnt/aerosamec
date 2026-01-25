const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


async function main() {
  // Usuario Admin
  await prisma.usuario.create({
    data: {
      email: 'admin@aerosamec.com',
      password: '$2a$12$Hd2gBq.pQ0ZggNhF7msXYugSgCeLADEf9THIynw6MFcTS7lVCHV6y', // Usa bcrypt para hashear 'admin123' (ej. online tool o código)
      nombre: 'Admin',
      apellido: 'Sistema',
      dni: '12345678',
      rol: 'ADMIN',
      funcion: 'ADMINISTRATIVO',
      passwordTemporal: false,
      emailVerificado: true,
    },
  });

  // Usuario Coordinador
  await prisma.usuario.create({
    data: {
      email: 'coord@aerosamec.com',
      password: '$2a$12$HSIP8bJPrwdV.bsmNDIV1urpK93Bf1xdkdza/5D7gGHc8Zm3OicDi', // Hashea 'coord123'
      nombre: 'Coordinador',
      apellido: 'Medico',
      dni: '87654321',
      rol: 'COORDINADOR',
      funcion: 'MEDICO',
      passwordTemporal: false,
      emailVerificado: true,
    },
  });

  console.log('Usuarios de prueba creados');
}

main().catch(e => console.error(e)).finally(async () => await prisma.$disconnect());