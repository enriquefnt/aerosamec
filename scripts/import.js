const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const data = require('./data.json');

async function importData() {
  for (const usuario of data.usuarios) {
    await prisma.usuario.create({ data: usuario });
  }
  // Importa otros...
}

importData().then(() => prisma.$disconnect());