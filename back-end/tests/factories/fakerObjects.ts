import { faker } from "@faker-js/faker";

export const newRecommendationFaker = () => {
  const recommendation = {
    name: faker.music.songName(),
    youtubeLink: `https://www.youtube.com/watch?v=${faker.internet.password(
      11
    )}`,
  };
  return recommendation;
};
