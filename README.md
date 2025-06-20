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
- Custom domain support

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
   # or
   npx serverless deploy --stage prod
   ```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
NODE_ENV=production
LOG_LEVEL=debug
LINKS_TABLE=serverless-link-shortener-prod-links
CUSTOM_DOMAIN=your-domain.com
CUSTOM_DOMAIN_CERTIFICATE_ARN=arn:aws:acm:region:account-id:certificate/certificate-id
```

## API Endpoints

Base URL: https://[your-domain.com] or https://[your-api-id].execute-api.[your-region].amazonaws.com/[stage]

### Create a Short Link

**POST** `/links`

Request body:
```json
{
  "originalUrl": "https://example.com/very/long/url",
  "expiresAt": "2024-01-01T00:00:00.000Z"
}
```

### Get Link Details

**GET** `/{shortCode}`

### Redirect to Original URL

**GET** `/r/{shortCode}`

### Update Link

**PUT** `/links/{shortCode}`

### Delete Link

**DELETE** `/links/{shortCode}`

### List All Links

**GET** `/links`

Query parameters:
- `limit`: Number of items per page (default: 10, max: 50)
- `lastEvaluatedKey`: Pagination token for the next page of results

## Authentication

All endpoints except `GET /{shortCode}` and `GET /r/{shortCode}` require authentication. Include your API key in the `x-api-key` header.

You can get your API key after deployment from the AWS API Gateway console or by using the AWS CLI.

## Security

- Rate limiting is implemented at the API Gateway level (100 req/sec with 200 burst)
- API keys are required for authenticated endpoints
- CORS is properly configured
- Input validation is performed on all endpoints

## Monitoring

- CloudWatch Logs are enabled for all Lambda functions
- API Gateway access logging can be enabled for detailed request tracking

## Custom Domain Configuration

This project supports using a custom domain instead of the default API Gateway URL. If you use an external DNS provider (not Route 53):

1. Set `createRoute53Record: false` in `serverless.yml` under `customDomain` (already set).
2. After running `npx serverless create_domain --stage prod`, manually add the following CNAME records to your DNS provider:
   - **ACM Certificate Validation:**
     - Name: `_your-acm-validation-id.your-domain.com.`
     - Type: `CNAME`
     - Value: `_your-acm-validation-value.acm-validations.aws.`
   - **API Gateway Custom Domain:**
     - Name: `your-domain.com.`
     - Type: `CNAME`
     - Value: `your-api-gateway-domain.cloudfront.net.`
   - (Replace the above placeholders with actual values from ACM and API Gateway outputs.)
3. Ensure your ACM certificate is in the same region as your API Gateway.

## API Key Authentication

- After deployment, get your API key from the AWS API Gateway console.
- Use this key in the `x-api-key` header for all authenticated endpoints.
- In Swagger UI, click the **Authorize** button and paste your API key.

## Troubleshooting

- **403/500 errors for Swagger UI static assets:**
  - The handler uses `swagger-ui-dist` to serve static files. Ensure you have run `npm install swagger-ui-dist`.
  - The `serverless.yml` includes a `{proxy+}` event for `/swagger-ui/{proxy+}` to route static asset requests.
- **DynamoDB access errors:**
  - Make sure your `LINKS_TABLE` environment variable matches the deployed stage (e.g., `serverless-link-shortener-prod-links` for production).
  - The Lambda IAM role must have permissions for the correct table.
- **Git push errors:**
  - If you see `non-fast-forward` errors, run `git pull origin main --no-rebase`, resolve any conflicts, then push again.

## Local Development

Start the local development server:

```bash
serverless offline start
```
