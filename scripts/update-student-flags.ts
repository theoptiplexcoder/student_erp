import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Updating student status flags based on lifecycleStatus...');

  const activeUpdate = await prisma.student.updateMany({
    where: {
      lifecycleStatus: 'ACTIVE',
    },
    data: {
      status: 'ACTIVE',
    },
  });
  console.log(`Updated ${activeUpdate.count} students to ACTIVE`);

  const graduatedUpdate = await prisma.student.updateMany({
    where: {
      lifecycleStatus: 'GRADUATED',
    },
    data: {
      status: 'INACTIVE',
    },
  });
  console.log(`Updated ${graduatedUpdate.count} students to INACTIVE`);

  console.log('Done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
