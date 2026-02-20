
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // 1. Create School
  const school = await prisma.school.create({
    data: {
      name: 'Escola Lumen',
    },
  });
  console.log(`Created school: ${school.name}`);

  // 2. Create Admin Teacher
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.teacher.create({
    data: {
      name: 'Admin Lumen',
      email: 'admin@lumen.com',
      password: adminPassword,
      isSchoolAdmin: true,
      schoolId: school.id,
    },
  });
  console.log(`Created admin: ${admin.name}`);

  // 3. Create Teachers
  const teacher1Password = await bcrypt.hash('prof1-123', 10);
  const teacher1 = await prisma.teacher.create({
    data: {
      name: 'Prof. Ana Silva',
      email: 'ana.silva@lumen.com',
      password: teacher1Password,
      schoolId: school.id,
    },
  });

  const teacher2Password = await bcrypt.hash('prof2-123', 10);
  const teacher2 = await prisma.teacher.create({
    data: {
      name: 'Prof. Bruno Costa',
      email: 'bruno.costa@lumen.com',
      password: teacher2Password,
      schoolId: school.id,
    },
  });
  console.log(`Created teachers: ${teacher1.name}, ${teacher2.name}`);

  // 4. Create Students
  const studentPassword = await bcrypt.hash('aluno123', 10);
  const studentsData = [
    { name: 'Carlos Pereira', username: 'carlosp' },
    { name: 'Fernanda Lima', username: 'fernandal' },
    { name: 'Gabriel Souza', username: 'gabriels' },
    { name: 'Helena Rocha', username: 'helenar' },
    { name: 'Igor Martins', username: 'igorm' },
  ];

  for (const student of studentsData) {
    await prisma.student.create({
      data: {
        ...student,
        password: studentPassword,
        schoolId: school.id,
      },
    });
  }
  console.log(`Created 5 students.`);

  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
