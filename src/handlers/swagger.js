const express = require('express');
const path = require('path');
const swaggerDocument = require('../swagger/swagger.json');
const serverless = require('serverless-http');
const swaggerUiDist = require('swagger-ui-dist');

const app = express();

// Serve Swagger UI static files from swagger-ui-dist
app.use('/swagger-ui', express.static(swaggerUiDist.getAbsoluteFSPath()));

// Serve Swagger UI at root /
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Swagger UI</title>
        <link rel="stylesheet" type="text/css" href="/swagger-ui/swagger-ui.css" />
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script src="/swagger-ui/swagger-ui-bundle.js"></script>
        <script>
          window.onload = function() {
            window.ui = SwaggerUIBundle({
              url: '/swagger.json',
              dom_id: '#swagger-ui'
            });
          };
        </script>
      </body>
    </html>
  `);
});

// Serve raw Swagger JSON at /swagger.json
app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerDocument);
});

// Handle favicon.ico requests
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

module.exports.handler = serverless(app);
