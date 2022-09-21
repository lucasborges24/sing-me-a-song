import supertest from "supertest";
import { faker } from "@faker-js/faker";
import app from "../src/app";

beforeEach(async () => {
  await deleteAllData();
});

afterAll(async () => {
  await disconnectPrisma();
});

const server = supertest(app);

