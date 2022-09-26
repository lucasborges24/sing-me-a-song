/*global cy*/
import { faker } from "@faker-js/faker";

beforeEach(() => {
  cy.resetDatabase();
});

describe("POST RECOMMENDATION", () => {
  it("should post a recommendation successfully", () => {
    const post = {
      name: faker.lorem.words(3),
      youtubeLink: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
    };
    cy.visit("http://localhost:3000");

    cy.get('[data-cy="Name"]').type(post.name);
    cy.get('[data-cy="Youtube"]').type(post.youtubeLink);
    cy.intercept("POST", "/recommendations").as("postRecommendation");
    cy.get('[data-cy="Post-Recommendation-Button"]').click();
    cy.wait("@postRecommendation");

    cy.get('[data-cy="Recommendation-name-video"]').should(
      "have.text",
      post.name
    );
  });
});

describe("POST RECOMMENDATION/:ID/UPVOTE", () => {
  it("should create an upvote successfully", () => {
    const post = {
      name: faker.lorem.words(3),
      youtubeLink: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
    };
    cy.visit("http://localhost:3000");

    cy.get('[data-cy="Name"]').type(post.name);
    cy.get('[data-cy="Youtube"]').type(post.youtubeLink);
    cy.intercept("POST", "/recommendations").as("postRecommendation");
    cy.get('[data-cy="Post-Recommendation-Button"]').click();
    cy.wait("@postRecommendation");

    cy.get('[data-cy="Recommendation-name-video"]').should(
      "have.text",
      post.name
    );

    cy.intercept("POST", "/recommendations/1/upvote").as(
      "upvoteRecommendation"
    );
    cy.get('[data-cy="upvote-button"]').click();
    cy.wait("@upvoteRecommendation");
    cy.get('[data-cy="vote-div"]').should("have.text", 1);
  });
});

describe("POST RECOMMENDATION/:ID/DOWNVOTE", () => {
  it("should create a downvote successfully", () => {
    const post = {
      name: faker.lorem.words(3),
      youtubeLink: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
    };
    cy.visit("http://localhost:3000");

    cy.get('[data-cy="Name"]').type(post.name);
    cy.get('[data-cy="Youtube"]').type(post.youtubeLink);
    cy.intercept("POST", "/recommendations").as("postRecommendation");
    cy.get('[data-cy="Post-Recommendation-Button"]').click();
    cy.wait("@postRecommendation");

    cy.get('[data-cy="Recommendation-name-video"]').should(
      "have.text",
      post.name
    );

    cy.intercept("POST", "/recommendations/1/downvote").as(
      "downvoteRecommendation"
    );
    cy.get('[data-cy="downvote-button"]').click();
    cy.wait("@downvoteRecommendation");
    cy.get('[data-cy="vote-div"]').should("have.text", -1);
  });
});

describe("GET RECOMMENDATION", () => {

  it("should return 10 recommendations even if there were more than 10 in database", () => {
    for (let i = 0; i < 12; i++) {
      cy.postRecommendation();
    }
    cy.visit("http://localhost:3000");
    cy.get("article").should("have.length", 10);
  });

  it("should return 5 recommendations if there are 5 in database", () => {
    const RECOMMENDATIONS = 5
    for (let i = 0; i < RECOMMENDATIONS; i++) {
      cy.postRecommendation();
    }
    cy.visit("http://localhost:3000");
    cy.get("article").should("have.length", RECOMMENDATIONS);
  });
});

describe("GET RECOMMENDATION/TOP", () => {
  it("should return recommendations decrease", () => {
    for (let i = 0; i < 5; i++) {
      cy.postRecommendation();
    }
    cy.visit("http://localhost:3000");

    cy.get('[data-cy="upvote-button"]').first().click();

    cy.visit("http://localhost:3000/top");
    cy.get('[data-cy="vote-div"]').first().should("have.text", 1);
    cy.get("article").should("have.length", 5);
  });
});

describe("GET RECOMMENDATION/RANDOM", () => {
  it("should return a random recommendation", () => {
    for (let i = 0; i < 5; i++) {
      cy.postRecommendation();
    }


    cy.visit("http://localhost:3000/random");
    cy.get("article").should("have.length", 1);
  });
});
