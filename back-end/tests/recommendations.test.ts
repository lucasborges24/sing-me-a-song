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
