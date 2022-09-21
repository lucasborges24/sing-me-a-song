import supertest from "supertest";
import { faker } from "@faker-js/faker";
import app from "../src/app";
import {
  deleteAllData,
  disconnectPrisma,
  ScenarioWithWhateverYouWantRecommendations,
} from "./factories/scenarioFactory";
import { prisma } from "../src/database";
import { newRecommendationFaker } from "./factories/fakerObjects";

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
