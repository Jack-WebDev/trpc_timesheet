import { de, faker } from "@faker-js/faker";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function insertDepartments() {
    const departments = await prisma.department.findMany();

  await prisma.project.createMany({
    data: [
      { projectName: "NUM", departmentID: departments[0]?.id, clientName: faker.company.catchPhrase(), description: faker.lorem.sentence(), projectManager: faker.person.firstName(), assignedMembers: [faker.person.firstName(), faker.person.firstName()],  },
      { projectName: "MSFAS", departmentID: departments[1]?.id, clientName: faker.company.catchPhrase(), description: faker.lorem.sentence(), projectManager: faker.person.firstName(), assignedMembers: [faker.person.firstName(), faker.person.firstName()],  },
      { projectName: "NHFC", departmentID: departments[2]?.id, clientName: faker.company.catchPhrase(), description: faker.lorem.sentence(), projectManager: faker.person.firstName(), assignedMembers: [faker.person.firstName(), faker.person.firstName()],  },
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
