const fs = require('fs');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger/swagger.json');

// Create a simple Express app to serve Swagger UI
const express = require('express');
const app = express();

// Serve Swagger UI at /swagger
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Serve raw Swagger JSON at /swagger.json
app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerDocument);
});

// Export the handler for serverless-http
const serverless = require('serverless-http');
module.exports.handler = serverless(app);
