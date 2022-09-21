import { prisma } from "../../src/database";
import { newRecommendationFaker } from "./fakerObjects";

export const deleteAllData = async () => {
  await prisma.$transaction([
    prisma.$executeRaw`TRUNCATE TABLE recommendations`,
  ]);
};

export const disconnectPrisma = async () => {
  await prisma.$disconnect();
};

export const ScenarioWithWhateverYouWantRecommendations = async (newRecommendations: number) => {
  const newRecommendationsArr = [];
  for (let i = 0; i < newRecommendations; i++) {
    const newSong = newRecommendationFaker();
    newRecommendationsArr.push(newSong);
  }
  await prisma.recommendation.createMany({
    data: newRecommendationsArr,
  });
  return;
};
