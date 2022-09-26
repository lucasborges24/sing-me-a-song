import { prisma } from "../../src/database";
import { newRecommendationFaker } from "./fakerObjects";
import { recommendationWithScoreByParam } from "./recommendationFactory";

export const deleteAllData = async () => {
  await prisma.$transaction([
    prisma.$executeRaw`TRUNCATE TABLE recommendations`,
  ]);
};

export const disconnectPrisma = async () => {
  await prisma.$disconnect();
};

export const ScenarioWithWhateverYouWantRecommendations = async (
  newRecommendations: number
) => {
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

export const scenarioOneRecommendation = async () => {
  const song = newRecommendationFaker();
  const data = await prisma.recommendation.create({
    data: song,
  });
  return data;
};

export const ScenarioWithWhateverYouWantRecommendationsWithParamScore = async (
  newRecommendation: number
) => {
  const newRecommendationsArr = [];
  for (let i = newRecommendation; i > 0; i--) {
    const recommendation = recommendationWithScoreByParam(i);
    newRecommendationsArr.push(recommendation);
  }
  const data = await prisma.recommendation.createMany({
    data: newRecommendationsArr,
  });
  return data;
};

export const scenarioRecommendationsWithScoreLessThanTen = async (
  recommendations: number
) => {
  const newRecommendationsArr = [];
  for (let i = 0; i < recommendations; i++) {
    const randomScore = Math.ceil((Math.random() - 0.5) * 10);
    const recommendation = recommendationWithScoreByParam(randomScore);
    newRecommendationsArr.push(recommendation);
  }
  const data = await prisma.recommendation.createMany({
    data: newRecommendationsArr,
  });
  return data;
};

export const scenarioRecommendationsWithScoreGreaterThanTen = async (
  recommendations: number
) => {
  const newRecommendationsArr = [];
  for (let i = 0; i < recommendations; i++) {
    const randomScore = Math.floor(Math.random() * (Math.random() * 100));
    const randomScoreGreaterThanTen = randomScore > 10 ? randomScore : 11;
    const recommendation = recommendationWithScoreByParam(
      randomScoreGreaterThanTen
    );
    newRecommendationsArr.push(recommendation);
  }
  const data = await prisma.recommendation.createMany({
    data: newRecommendationsArr,
  });
  return data;
};
