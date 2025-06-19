const { getLink, incrementClicks } = require('../utils/db');

// This handler is used by API Gateway to handle redirects
exports.handler = async (event) => {
  try {
    console.log('Redirect event:', JSON.stringify(event));
    const { shortCode } = event.pathParameters;
    console.log('Redirecting shortCode:', shortCode);
    
    const link = await getLink(shortCode);
    console.log('Link found:', link ? JSON.stringify(link) : 'null');
    
    if (!link) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Link not found or inactive'
      };
    }

    // Check if link has expired
    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      return {
        statusCode: 410,
        headers: { 'Content-Type': 'text/plain' },
        body: 'This link has expired'
      };
    }

    // Track the click asynchronously
    incrementClicks(shortCode).catch(console.error);

    // Redirect to the original URL
    return {
      statusCode: 302,
      headers: {
        Location: link.originalUrl,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      body: ''
    };
  } catch (error) {
    console.error('Redirect error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/plain' },
      body: 'An error occurred while processing your request'
    };
  }
};
