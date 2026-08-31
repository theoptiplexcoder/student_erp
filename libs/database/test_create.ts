import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const depts = await (prisma as any).department.createManyAndReturn({
    data: [
      { name: 'Test Dept 1', code: 'T1', institutionId: '00000000-0000-0000-0000-000000000001' },
      { name: 'Test Dept 2', code: 'T2', institutionId: '00000000-0000-0000-0000-000000000001' },
    ],
  });
  console.log(depts.map((d) => d.id));
}
run();
