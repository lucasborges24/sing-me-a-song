// ***********************************************
/*global cy, Cypress*/

import { faker } from "@faker-js/faker";

// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
Cypress.Commands.add("resetDatabase", () => {
  cy.request("POST", "http://localhost:5000/recommendations/reset-database");
});

Cypress.Commands.add("postRecommendation", () => {
  const body = {
    name: faker.lorem.words(3),
    youtubeLink: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
  };
  cy.request("POST", "http://localhost:5000/recommendations/", body);
});

Cypress.Commands.add("postRecommendationWithScore", (score) => {
  const body = {
    name: faker.lorem.words(3),
    youtubeLink: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
  };
  cy.request("POST", "http://localhost:5000/recommendations/", body);

  for (let i = 0; i > score; i++) {
    cy.request("POST", "/recommendations/1/upvote");
  }
});
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
