import { faker } from "@faker-js/faker";
import { Recommendation } from "@prisma/client";
import { prisma } from "../../src/database";
import { newRecommendationFaker } from "./fakerObjects";

type createRecommendationType = Omit<Recommendation, "id">;

export const YOUTUBEURL = "https://www.youtube.com/watch?v="

export const recommendationWithScoreByParam = (score: number) => {
  const recommendation: createRecommendationType = {
    ...newRecommendationFaker(),
    score,
  };
  return recommendation;
};

export const recommendationByPrismaFactory = (): Recommendation => {
  return {
    id: +faker.random.numeric(4),
    name: faker.lorem.words(3),
    youtubeLink: YOUTUBEURL + faker.internet.password(11),
    score: +faker.random.numeric()
  }
}

export const recommendationByPrismaFactoryScoreLessThanFive = (): Recommendation => {
  return {
    id: +faker.random.numeric(4),
    name: faker.lorem.words(3),
    youtubeLink: YOUTUBEURL + faker.internet.password(11),
    score: -6
  }
}


// export const findRecommendationsByParam = async (number: number) => {
    
//         const recommendation = prisma.recommendation.find
    
// }
