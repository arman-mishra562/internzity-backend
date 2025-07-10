// import { PrismaClient } from '@prisma/client';
// // import * as XLSX from 'xlsx';
// import path from 'path';

// const prisma = new PrismaClient();

// function fixDates(row: any) {
//     for (const key of Object.keys(row)) {
//         if (
//             key.toLowerCase().includes('date') ||
//             key.toLowerCase().includes('at')
//         ) {
//             if (typeof row[key] === 'string' && row[key].includes(' ')) {
//                 row[key] = new Date(row[key].replace(' ', 'T') + 'Z').toISOString();
//             }
//         }
//         if (row[key] === 'true') row[key] = true;
//         if (row[key] === 'false') row[key] = false;
//         // Convert comma-separated expertise to array for Instructor
//         if (key === 'expertise' && typeof row[key] === 'string') {
//             row[key] = row[key].split(',').map((s: string) => s.trim());
//         }
//     }
//     return row;
// }

// async function seedFromExcel(file: string, model: keyof typeof prisma) {
//     const filePath = path.join(__dirname, file);
//     const workbook = XLSX.readFile(filePath);
//     const sheetName = workbook.SheetNames[0];
//     const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
//     for (const row of data) {
//         // @ts-ignore
//         await prisma[model].create({ data: fixDates(row) });
//     }
// }

// async function main() {
//     await seedFromExcel('User.xlsx', 'user');
//     await seedFromExcel('Instructor.xlsx', 'instructor');
//     await seedFromExcel('Stream.xlsx', 'stream');
//     await seedFromExcel('Course.xlsx', 'course');
//     await seedFromExcel('CourseInstructor.xlsx', 'courseInstructor');
//     await seedFromExcel('Media.xlsx', 'media');
//     // If you add CoursePrice.xlsx, uncomment below:
//     // await seedFromExcel('CoursePrice.xlsx', 'coursePrice');
// }

// main()
//     .catch((e) => {
//         console.error(e);
//         process.exit(1);
//     })
//     .finally(async () => {
//         await prisma.$disconnect();
//     }); 