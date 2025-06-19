# Serverless Link Shortener

A zero-maintenance, serverless link shortener built with AWS Lambda, API Gateway, and DynamoDB.

## Features

- Create, read, update, and delete short links
- Custom aliases for short URLs
- Link expiration
- Click tracking
- API key authentication
- Rate limiting (100 req/sec with 200 burst)
- Auto-scaling infrastructure
- Zero maintenance required
- No user management - simple API-based approach

## Prerequisites

- Node.js 20.x
- AWS Account with appropriate permissions
- AWS CLI configured with credentials
- Serverless Framework installed globally (`npm install -g serverless`)

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```
4. Deploy to AWS:
   ```bash
   npm run deploy
   ```
   For production:
   ```bash
   npm run deploy:prod
   ```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
NODE_ENV=development
```

## API Endpoints

Base URL: https://[your-api-id].execute-api.[your-region].amazonaws.com/[stage]

### Create a Short Link

**POST** `/links`

Request body:
```json
{
  "originalUrl": "https://example.com/very/long/url",
  "shortCode": "example",
  "expiresAt": "2024-01-01T00:00:00.000Z"
}
```

Curl example:
```bash
curl -X POST \
  'https://[your-api-id].execute-api.[your-region].amazonaws.com/[stage]/links' \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: [your-api-key]' \
  -d '{
    "originalUrl": "https://example.com/very/long/url",
    "shortCode": "example"
  }'

### Get Link Details

**GET** `/{shortCode}`

Curl example:
```bash
curl -X GET 'https://[your-api-id].execute-api.[your-region].amazonaws.com/[stage]/example'
```

### Redirect to Original URL

**GET** `/r/{shortCode}`

Curl example:
```bash
curl -L -X GET 'https://[your-api-id].execute-api.[your-region].amazonaws.com/[stage]/r/example'
```

### Update Link

**PUT** `/links/{shortCode}`

Curl example:
```bash
curl -X PUT \
  'https://[your-api-id].execute-api.[your-region].amazonaws.com/[stage]/links/example' \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: [your-api-key]' \
  -d '{
    "originalUrl": "https://example.com/updated/url"
  }'
```

### Delete Link

**DELETE** `/links/{shortCode}`

Curl example:
```bash
curl -X DELETE \
  'https://[your-api-id].execute-api.[your-region].amazonaws.com/[stage]/links/example' \
  -H 'x-api-key: [your-api-key]'
```

### List All Links

**GET** `/links`

Query parameters:
- `limit`: Number of items per page (default: 10, max: 50)
- `lastEvaluatedKey`: Pagination token for the next page of results

Curl example:
```bash
curl -X GET \
  'https://[your-api-id].execute-api.[your-region].amazonaws.com/[stage]/links?limit=5' \
  -H 'x-api-key: [your-api-key]'
```

## Authentication

All endpoints except `GET /{shortCode}` and `GET /r/{shortCode}` require authentication. Include your API key in the `x-api-key` header:

```
x-api-key: [your-api-key]
```

You can get your API key after deployment from the AWS API Gateway console or by using the AWS CLI:

```bash
aws apigateway get-api-keys --name-query "serverless-link-shortener-dev-key" --include-values
```

## Security

- Rate limiting is implemented at the API Gateway level (100 req/sec with 200 burst)
- API keys are required for authenticated endpoints
- CORS is properly configured
- Input validation is performed on all endpoints

## Monitoring

- CloudWatch Logs are enabled for all Lambda functions
- API Gateway access logging can be enabled for detailed request tracking

## Local Development

To run the application locally:

```bash
npm install
serverless offline start
```


