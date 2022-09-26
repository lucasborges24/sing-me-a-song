import { expect, jest, test } from "@jest/globals";
import { recommendationRepository } from "../../src/repositories/recommendationRepository";
import { Recommendation } from "@prisma/client";
import { recommendationService } from "../../src/services/recommendationsService";
import { newRecommendationFaker } from "../factories/fakerObjects";
import {
  recommendationByPrismaFactory,
  recommendationByPrismaFactoryScoreLessThanFive,
} from "../factories/recommendationFactory";
import { faker } from "@faker-js/faker";
import { notFoundError } from "../../src/utils/errorUtils";

beforeEach(() => {
  jest.resetAllMocks();
  jest.clearAllMocks();
});

describe("Test insert function", () => {
  it("should return a conflict error when name passed is duplicated", async () => {
    const newSong = newRecommendationFaker();
    const expectedSong = recommendationByPrismaFactory();

    jest
      .spyOn(recommendationRepository, "findByName")
      .mockResolvedValueOnce(expectedSong);
    jest.spyOn(recommendationRepository, "create");

    const promise = recommendationService.insert(newSong);

    expect(promise).rejects.toMatchObject({
      type: "conflict",
      message: "Recommendations names must be unique",
    });
    expect(recommendationRepository.create).not.toBeCalled();
  });

  it("should create a recommendation song", async () => {
    const newSong = newRecommendationFaker();
    jest
      .spyOn(recommendationRepository, "findByName")
      .mockResolvedValueOnce(null);
    jest.spyOn(recommendationRepository, "create");

    await recommendationService.insert(newSong);

    expect(recommendationRepository.create).toBeCalledTimes(1);
  });
});

describe("Test upvote function", () => {
  it("should update score", async () => {
    const id = +faker.random.numeric();
    const recommendation = recommendationByPrismaFactory();
    jest
      .spyOn(recommendationService, "getById")
      .mockResolvedValueOnce(recommendation);
    jest
      .spyOn(recommendationRepository, "find")
      .mockResolvedValueOnce(recommendation);
    jest
      .spyOn(recommendationRepository, "updateScore")
      .mockImplementationOnce((): any => {});

    await recommendationService.upvote(id);

    expect(recommendationRepository.updateScore).toBeCalledTimes(1);
  });

  // it("should return a Not Found error if Id doesn't exist", async () => {
  //   const id = +faker.random.numeric();
  //   const recommendation = recommendationByPrismaFactory();
  //   jest.spyOn(recommendationService, "getById").mockRejectedValueOnce('error');
  //   jest.spyOn(recommendationRepository, "updateScore");

  //   expect(recommendationService.upvote(id)).rejects.toMatchObject({
  //     "message": "",
  //     "type": "not_found",
  //   });
  // })
});

describe("Test downvote function", () => {
  it("should update score", async () => {
    const id = +faker.random.numeric();
    const recommendation = recommendationByPrismaFactory();
    jest
      .spyOn(recommendationService, "getById")
      .mockResolvedValueOnce(recommendation);
    jest
      .spyOn(recommendationRepository, "find")
      .mockResolvedValueOnce(recommendation);
    jest
      .spyOn(recommendationRepository, "updateScore")
      .mockResolvedValueOnce(recommendation);
    jest.spyOn(recommendationRepository, "remove").mockResolvedValueOnce();

    await recommendationService.downvote(id);

    expect(recommendationRepository.updateScore).toBeCalledTimes(1);
    expect(recommendationRepository.remove).not.toBeCalled();
  });

  it("should remove a recommendation", async () => {
    const id = +faker.random.numeric();
    const recommendationWithScoreLessThanFive =
      recommendationByPrismaFactoryScoreLessThanFive();
    jest
      .spyOn(recommendationService, "getById")
      .mockResolvedValueOnce(recommendationWithScoreLessThanFive);
    jest
      .spyOn(recommendationRepository, "find")
      .mockResolvedValueOnce(recommendationWithScoreLessThanFive);
    jest
      .spyOn(recommendationRepository, "updateScore")
      .mockResolvedValueOnce(recommendationWithScoreLessThanFive);
    jest.spyOn(recommendationRepository, "remove").mockResolvedValueOnce();

    await recommendationService.downvote(id);

    expect(recommendationRepository.updateScore).toBeCalledTimes(1);
    expect(recommendationRepository.remove).toBeCalledTimes(1);
  });

  it("should return a error", async () => {
    const id = +faker.random.numeric();
    const recommendationWithScoreLessThanFive =
      recommendationByPrismaFactoryScoreLessThanFive();
    // jest
    //   .spyOn(recommendationService, "getById")
    //   .mockResolvedValueOnce(recommendationWithScoreLessThanFive);
    jest.spyOn(recommendationRepository, "find").mockResolvedValueOnce(null);
    jest
      .spyOn(recommendationRepository, "updateScore")
      .mockResolvedValueOnce(recommendationWithScoreLessThanFive);
    jest.spyOn(recommendationRepository, "remove").mockResolvedValueOnce();

    const promise = recommendationService.downvote(id);

    expect(promise).rejects.toMatchObject({
      type: "not_found",
      message: "",
    });
    expect(recommendationRepository.updateScore).not.toBeCalled();
    expect(recommendationRepository.remove).not.toBeCalled();
  });
});

describe("test get function", () => {
  it("should find all recommendations", async () => {
    const recommendation = recommendationByPrismaFactory();

    jest
      .spyOn(recommendationRepository, "findAll")
      .mockResolvedValueOnce([recommendation]);

    const get = await recommendationService.get();

    expect(recommendationRepository.findAll).toBeCalledTimes(1);
    expect(get).toBeInstanceOf(Array);
  });
});

describe("test getTop function", () => {
  it("should return an Array by getAmountByScore", async () => {
    const recommendations = [recommendationByPrismaFactory()];
    const amount = +faker.random.numeric(2);
    jest
      .spyOn(recommendationRepository, "getAmountByScore")
      .mockResolvedValueOnce(recommendations);

    const getTopReturn = await recommendationService.getTop(amount);

    expect(getTopReturn).toBeInstanceOf(Array);
    expect(recommendationRepository.getAmountByScore).toBeCalledTimes(1);
  });
});

describe("test getRandom function", () => {
  it("should return one recommendation", async () => {
    const recommendationss = [recommendationByPrismaFactory(), recommendationByPrismaFactory()];

    jest.spyOn(Math, "random").mockImplementationOnce(() => 0.8);
    jest.spyOn(Math, "floor").mockImplementationOnce(() => 1);
    // jest
    //   .spyOn(recommendationService, "getScoreFilter")
    //   .mockImplementationOnce(() => "gt");
    jest
      .spyOn(recommendationRepository, "findAll")
      .mockResolvedValueOnce(recommendationss);

    const getRandomReturn = await recommendationService.getRandom();

    expect(getRandomReturn).toBeInstanceOf(Object);
    expect(Math.floor).toBeCalledTimes(1);
  });

  it("should return an error", async () => {
    jest.spyOn(Math, 'random').mockImplementationOnce(() => 0.)
    jest.spyOn(recommendationRepository, "findAll").mockResolvedValue([]);

    const promise = recommendationService.getRandom();
    expect(promise).rejects.toEqual({
      type: "not_found",
      message: "",
    });
    expect(recommendationRepository.findAll).toBeCalled();
  });
});

describe("test getByScore function", () => {
  it("should return a array with All recommendations", async () => {
    const scoreFilter = "gt";
    jest.spyOn(recommendationRepository, "findAll").mockResolvedValueOnce([]);

    await recommendationService.getByScore(scoreFilter);

    expect(recommendationRepository.findAll).toBeCalledTimes(2);
  });

  // it("should return an array with Scorest Recommendations", async () => {
  //   const recommendations = [recommendationByPrismaFactory()];

  //   jest
  //     .spyOn(recommendationRepository, "findAll")
  //     .mockResolvedValueOnce();
  // })
});
