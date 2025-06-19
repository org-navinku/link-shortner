/**
 * Generates a standardized API Gateway response
 * @param {number} statusCode - HTTP status code
 * @param {Object} body - Response body
 * @returns {Object} API Gateway response object
 */
function generateResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
      'Access-Control-Allow-Methods': 'DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT'
    },
    body: JSON.stringify(body, null, 2)
  };
}

/**
 * Validates request body against a schema
 * @param {Object} body - Request body
 * @param {z.ZodSchema} schema - Zod schema for validation
 * @returns {Object} Validation result with success status and data/error
 */
function validateRequestBody(body, schema) {
  try {
    const parsedBody = typeof body === 'string' ? JSON.parse(body) : body;
    const result = schema.safeParse(parsedBody);
    
    if (!result.success) {
      return {
        isValid: false,
        error: generateResponse(400, {
          message: 'Validation error',
          code: 'VALIDATION_ERROR',
          issues: result.error.issues
        })
      };
    }
    
    return { isValid: true, data: result.data };
  } catch (error) {
    return {
      isValid: false,
      error: generateResponse(400, {
        message: 'Invalid JSON body',
        code: 'INVALID_JSON'
      })
    };
  }
}

module.exports = {
  generateResponse,
  validateRequestBody
};
