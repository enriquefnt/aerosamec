const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.usuario.create({
    data: {
      email: 'admin@aerosamec.com',
      password: '$2a$12$Hd2gBq.pQ0ZggNhF7msXYugSgCeLADEf9THIynw6MFcTS7lVCHV6y',
      nombre: 'Admin',
      apellido: 'Sistema',
      dni: '12345678',
      rol: 'ADMIN',
      funcion: 'ADMINISTRATIVO',
      passwordTemporal: false,
      emailVerificado: true,
    },
  });

  await prisma.usuario.create({
    data: {
      email: 'coord@aerosamec.com',
      password: '$2a$12$HSIP8bJPrwdV.bsmNDIV1urpK93Bf1xdkdza/5D7gGHc8Zm3OicDi',
      nombre: 'Coordinador',
      apellido: 'Medico',
      dni: '87654321',
      rol: 'COORDINADOR',
      funcion: 'MEDICO',
      passwordTemporal: false,
      emailVerificado: true,
    },
  });

  await prisma.usuario.create({
    data: {
      email: 'operador@aerosamec.com',
      password: '$2a$12$HSIP8bJPrwdV.bsmNDIV1urpK93Bf1xdkdza/5D7gGHc8Zm3OicDi',
      nombre: 'Operador',
      apellido: 'Medico',
      dni: '87654322',
      rol: 'OPERADOR',
      funcion: 'MEDICO',
      passwordTemporal: false,
      emailVerificado: true,
    },
  });

  console.log('Usuarios de prueba creados');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
