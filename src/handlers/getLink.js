const { getLink } = require('../utils/db');
const { generateResponse } = require('../utils/response');

exports.handler = async (event) => {
  try {
    const { shortCode } = event.pathParameters;
    
    const link = await getLink(shortCode);
    
    if (!link) {
      return generateResponse(404, {
        message: 'Link not found',
        code: 'LINK_NOT_FOUND'
      });
    }

    // Return the link data
    
    return generateResponse(200, {
      data: link
    });
  } catch (error) {
    console.error('Error getting link:', error);
    return generateResponse(500, {
      message: 'Failed to retrieve link',
      error: error.message
    });
  }
};
