import { prisma } from "../../src/database";
export const deleteAllData = async () => {
  await prisma.$transaction([
    prisma.$executeRaw`TRUNCATE TABLE recommendations`,
  ]);
};

export const disconnectPrisma = async () => {
  await prisma.$disconnect();
};
