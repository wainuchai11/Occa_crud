const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Your API Documentation",
      version: "1.0.0",
      description: "Documentation for your API endpoints",
    },
  },
  apis: ["index.js"], // Replace with the path to your route files
};

const specs = swaggerJsdoc(options);
module.exports = specs;
