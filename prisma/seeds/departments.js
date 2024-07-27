import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function insertDepartments() {
  await prisma.department.createMany({
    data: [
      { departmentName: "H.R" },
      { departmentName: "Digital Technologies" },
      { departmentName: "Marketing" }
    ],
  });
}

insertDepartments()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
