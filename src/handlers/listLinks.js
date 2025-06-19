const { listLinks } = require('../utils/db');
const { generateResponse } = require('../utils/response');

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

exports.handler = async (event) => {
  try {
    const queryParams = event.queryStringParameters || {};
    
    // Parse pagination parameters
    const limit = Math.min(
      parseInt(queryParams.limit, 10) || DEFAULT_LIMIT,
      MAX_LIMIT
    );
    
    const lastEvaluatedKey = queryParams.lastEvaluatedKey || null;

    // Get all links
    const { items: links, lastEvaluatedKey: nextKey } = await listLinks(
      limit,
      lastEvaluatedKey
    );

    // Prepare response
    const response = {
      data: links,
      pagination: {
        count: links.length,
        limit,
        ...(nextKey && { nextKey })
      }
    };

    return generateResponse(200, response);
  } catch (error) {
    console.error('Error listing links:', error);
    return generateResponse(500, {
      message: 'Failed to retrieve links',
      error: error.message
    });
  }
};
