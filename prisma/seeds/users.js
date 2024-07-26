import bcrypt from "bcryptjs";
import { faker } from "@faker-js/faker";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function generateIdNumber() {
  const RSA_ID_NUMBER_LENGTH = 13;
  const RSA_ID_NUMBER_CHARS = "0123456789";
  let RSA_ID_NUMBER = "";

  for (let i = 0; i < RSA_ID_NUMBER_LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * RSA_ID_NUMBER_CHARS.length);
    RSA_ID_NUMBER += RSA_ID_NUMBER_CHARS[randomIndex];
  }
  return RSA_ID_NUMBER;
}

function provinces() {
  const provinces = [
    "Gauteng",
    "Western Cape",
    "KwaZulu-Natal",
    "Eastern Cape",
    "Mpumalanga",
    "Limpopo",
    "North West",
    "Northern Cape",
    "Western Cape",
  ];
  return provinces[Math.floor(Math.random() * provinces.length)];
}




async function insertData() {

  const departments = await prisma.department.findMany();

  await prisma.user.createMany({
    data: [
      {
        id: faker.string.uuid(),
        email: faker.internet.email(),
        title: "Mr.",
        name: faker.person.firstName(),
        surname: faker.person.lastName(),
        idNumber: generateIdNumber(),
        mobileNumber: faker.phone.number(),
        password: bcrypt.hashSync("Jack@123", 10),
        nationality: "Citizen",
        gender: "Male",
        ethnicity: "Black",
        role: "Employee",
        address: faker.location.streetAddress(),
        city: faker.location.city(),
        zipCode: faker.location.zipCode(),
        province: provinces(),
        departmentId: departments[0]?.id,
        departmentName: departments[0]?.departmentName,
        dob: "1991-01-01",
        employeeType: faker.person.jobType(),
        maritalStatus: "Single",
        ndtEmail: "jack@ndt.co.za",
        officeLocation: faker.person.jobArea(),
        position: faker.person.jobTitle(),
        startDate: "2023-01-01",
        createdAt: faker.date.recent(),
      },
      {
        id: faker.string.uuid(),
        email: faker.internet.email(),
        title: "Mr.",
        name: faker.person.firstName(),
        surname: faker.person.lastName(),
        idNumber: generateIdNumber(),
        mobileNumber: faker.phone.number(),
        password: bcrypt.hashSync("Jack@123", 10),
        nationality: "Citizen",
        gender: "Male",
        ethnicity: "Black",
        role: "Manager",
        address: faker.location.streetAddress(),
        city: faker.location.city(),
        zipCode: faker.location.zipCode(),
        province: provinces(),
        departmentId: departments[1]?.id,
        departmentName: departments[1]?.departmentName,
        dob: "1991-01-01",
        employeeType: faker.person.jobType(),
        maritalStatus: "Single",
        ndtEmail: "manager@ndt.co.za",
        officeLocation: faker.person.jobArea(),
        position: faker.person.jobTitle(),
        startDate: "2023-01-01",
        createdAt: faker.date.recent(),
      },
      {
        id: faker.string.uuid(),
        email: faker.internet.email(),
        title: "Mr.",
        name: faker.person.firstName(),
        surname: faker.person.lastName(),
        idNumber: generateIdNumber(),
        mobileNumber: faker.phone.number(),
        password: bcrypt.hashSync("Jack@123", 10),
        nationality: "Citizen",
        gender: "Male",
        ethnicity: "Black",
        role: "Admin",
        address: faker.location.streetAddress(),
        city: faker.location.city(),
        zipCode: faker.location.zipCode(),
        province: provinces(),
        departmentId: departments[2]?.id,
        departmentName: departments[2]?.departmentName,
        dob: "1991-01-01",
        employeeType: faker.person.jobType(),
        maritalStatus: "Single",
        ndtEmail: "admin@ndt.co.za",
        officeLocation: faker.person.jobArea(),
        position: faker.person.jobTitle(),
        startDate: "2023-01-01",
        createdAt: faker.date.recent(),
      },
    ],
  });
}

insertData()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
