const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function exportData() {
  const usuarios = await prisma.usuario.findMany();
  const traslados = await prisma.traslado.findMany();
  // Exporta otros modelos...
  console.log(JSON.stringify({ usuarios, traslados }, null, 2));
}

exportData().then(() => prisma.$disconnect());