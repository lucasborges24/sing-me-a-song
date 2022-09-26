import supertest from "supertest";
import app from "../../src/app";
import {
  deleteAllData,
  disconnectPrisma,
  scenarioOneRecommendation,
  scenarioRecommendationsWithScoreGreaterThanTen,
  scenarioRecommendationsWithScoreLessThanTen,
  ScenarioWithWhateverYouWantRecommendations,
  ScenarioWithWhateverYouWantRecommendationsWithParamScore,
} from "../factories/scenarioFactory";
import { prisma } from "../../src/database";
import { newRecommendationFaker } from "../factories/fakerObjects";
import {
  EIGHTY_PERCENT,
  FOURTY_PERCENT,
  SIXTY_PERCENT,
  TWENTY_PERCENT,
} from "../factories/percentFactory";

beforeEach(async () => {
  await deleteAllData();
});

afterAll(async () => {
  await disconnectPrisma();
});

const server = supertest(app);

describe("POST /recommendations", () => {
  it("Should create a new song recommendation with status 201", async () => {
    const newSong = newRecommendationFaker();
    const result = await server.post("/recommendations").send(newSong);
    const createdSong = await prisma.recommendation.findFirst({
      where: {
        name: newSong.name,
        youtubeLink: newSong.youtubeLink,
      },
    });
    expect(result.status).toBe(201);
    expect(createdSong).not.toBeNull();
  });
});

describe("POST /recommendations/:id/upvote", () => {
  it("Should create a upvote with status 200", async () => {
    const newSong = newRecommendationFaker();
    await server.post("/recommendations").send(newSong);
    const createdSong = await prisma.recommendation.findFirst({
      where: {
        name: newSong.name,
        youtubeLink: newSong.youtubeLink,
      },
    });
    const result = await server.post(
      `/recommendations/${createdSong.id}/upvote`
    );
    expect(result.status).toBe(200);
  });
});

describe("POST /recommendations/:id/downvote", () => {
  it("Should create a downvote with status 200", async () => {
    const newSong = newRecommendationFaker();
    await server.post("/recommendations").send(newSong);
    const createdSong = await prisma.recommendation.findFirst({
      where: {
        name: newSong.name,
        youtubeLink: newSong.youtubeLink,
      },
    });
    const result = await server.post(
      `/recommendations/${createdSong.id}/downvote`
    );
    expect(result.status).toBe(200);
  });

  it("Should remove a recommentation to downvotes less than -5 with status 200", async () => {
    const newSong = newRecommendationFaker();
    await server.post("/recommendations").send(newSong);
    const createdSong = await prisma.recommendation.findFirst({
      where: {
        name: newSong.name,
        youtubeLink: newSong.youtubeLink,
      },
    });
    await prisma.recommendation.update({
      where: {
        id: createdSong.id,
      },
      data: {
        score: -5,
      },
    });
    const result = await server.post(
      `/recommendations/${createdSong.id}/downvote`
    );
    const excludedSong = await prisma.recommendation.findUnique({
      where: {
        id: createdSong.id,
      },
    });
    expect(excludedSong).toBeNull();
    expect(result.status).toBe(200);
  });
});

describe("GET /recommendations", () => {
  it("should return ten recommendations with status 200", async () => {
    await ScenarioWithWhateverYouWantRecommendations(11);
    const result = await server.get("/recommendations");

    expect(result.status).toBe(200);
    expect(result.body).toBeInstanceOf(Array);
    expect(result.body).toHaveLength(10);
  });

  it("should return all recomendations with status 200 when total recommentations are less than ten", async () => {
    const RECOMMENDATIONS = 5;
    await ScenarioWithWhateverYouWantRecommendations(RECOMMENDATIONS);

    const result = await server.get("/recommendations");
    expect(result.status).toBe(200);
    expect(result.body).toBeInstanceOf(Array);
    expect(result.body).toHaveLength(RECOMMENDATIONS);
  });
});

describe("GET /recommendations/:id", () => {
  it("should return one recommendation by id with status 200", async () => {
    const { id, name, youtubeLink } = await scenarioOneRecommendation();
    const result = await server.get(`/recommendations/${id}`);

    expect(result.status).toBe(200);
    expect(result.body).toBeInstanceOf(Object);
    expect(result.body).toHaveProperty("name", name);
    expect(result.body).toHaveProperty("youtubeLink", youtubeLink);
  });
});

describe("GET /recommendations/random", () => {
  it("should return approx 70% songs with score greater than 10 and 30% less than or equal 10 with precision of 90%", async () => {
    const REQUESTS = 50;
    const RECOMMENDATIONS_SCORE_LESS_THAN_TEN = 14;
    const RECOMMENDATIONS_SCORE_GREATER_THAN_TEN = 6;
    const greaterThanAcceptableMinInterval = SIXTY_PERCENT * REQUESTS;
    const greaterThanAcceptableMaxInterval = EIGHTY_PERCENT * REQUESTS;
    const lessThanAcceptableMinInterval = TWENTY_PERCENT * REQUESTS;
    const lessThanAcceptableMaxInterval = FOURTY_PERCENT * REQUESTS;

    await scenarioRecommendationsWithScoreLessThanTen(
      RECOMMENDATIONS_SCORE_LESS_THAN_TEN
    );
    await scenarioRecommendationsWithScoreGreaterThanTen(
      RECOMMENDATIONS_SCORE_GREATER_THAN_TEN
    );

    let resultArr = [];
    for (let i = 0; i < REQUESTS; i++) {
      const result = await server.get("/recommendations/random");
      resultArr.push(result.body.score);
    }
    Promise.all(resultArr);
    const lessThanTenCount = resultArr.filter((i) => i <= 10 && i >= -5).length;
    const GreaterThanTenCount = REQUESTS - lessThanTenCount;
    console.log(lessThanTenCount, GreaterThanTenCount);

    expect(lessThanTenCount).toBeWithinRange(
      lessThanAcceptableMinInterval,
      lessThanAcceptableMaxInterval
    );
    expect(GreaterThanTenCount).toBeWithinRange(
      greaterThanAcceptableMinInterval,
      greaterThanAcceptableMaxInterval
    );
  });
});

describe("GET /recommendations/top/:amount", () => {
  it("should return 20 scorest songs when there are 40 songs registered with status 200", async () => {
    await ScenarioWithWhateverYouWantRecommendationsWithParamScore(40);
    const recomendations = await prisma.recommendation.findMany();
    const result = await server.get("/recommendations/top/20");

    expect(result.status).toBe(200);
    expect(result.body).toBeInstanceOf(Array);
    expect(result.body[0].id).toBe(recomendations[0].id);
    expect(result.body[19].id).toBe(recomendations[19].id);
  });

  it("should return 12 scorest songs when there are 12 songs registered and is passed 20 to amount param with status 200", async () => {
    await ScenarioWithWhateverYouWantRecommendationsWithParamScore(12);
    const recomendations = await prisma.recommendation.findMany();
    const result = await server.get("/recommendations/top/20");

    expect(result.status).toBe(200);
    expect(result.body).toBeInstanceOf(Array);
    expect(result.body).toHaveLength(12);
    expect(result.body[0].id).toBe(recomendations[0].id);
  });
});
