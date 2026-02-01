    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    async function seedHospitales() {
      await prisma.hospital.create({
        data: {
          nombre: 'Hospital Central',
          direccion: 'Calle Principal 123',
          ciudad: 'Ciudad Ejemplo',
          provincia: 'Provincia Ejemplo',
          telefono: '123456789',
          email: 'hospital@ejemplo.com',
          tipo: 'Público',
        },
      });
      // Añade más si necesitas
      console.log('Hospitales creados');
    }

    seedHospitales().then(() => prisma.$disconnect());