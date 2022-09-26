import { faker } from "@faker-js/faker";

export const newRecommendationFaker = () => {
  const recommendation = {
    name: faker.lorem.words(3),
    youtubeLink: `https://www.youtube.com/watch?v=${faker.internet.password(
      11
    )}`,
  };
  return recommendation;
};

