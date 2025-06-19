const { deleteLink, getLink } = require('../utils/db');
const { generateResponse } = require('../utils/response');

exports.handler = async (event) => {
  try {
    const { shortCode } = event.pathParameters;
    
    // Check if link exists
    const existingLink = await getLink(shortCode);
    if (!existingLink) {
      return generateResponse(404, {
        message: 'Link not found',
        code: 'LINK_NOT_FOUND'
      });
    }

    await deleteLink(shortCode);

    return generateResponse(200, {
      message: 'Link deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting link:', error);
    return generateResponse(500, {
      message: 'Failed to delete link',
      error: error.message
    });
  }
};
