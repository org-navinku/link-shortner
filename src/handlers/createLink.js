// Import nanoid dynamically since it's an ES Module
let nanoid;
// We'll initialize nanoid in the handler
const { z } = require('zod');
const { generateResponse, validateRequestBody } = require('../utils/response');
const { createLink, getLink } = require('../utils/db');

// Input validation schema
const schema = z.object({
  originalUrl: z.string().url('Invalid URL format'),
  shortCode: z.string().min(3).max(20).optional(),
  expiresAt: z.string().datetime().optional()
});

exports.handler = async (event) => {
  try {
    // Dynamically import nanoid (ES Module)
    if (!nanoid) {
      const nanoidModule = await import('nanoid');
      nanoid = nanoidModule.nanoid;
    }
    
    console.log('Event:', JSON.stringify(event));
    console.log('Environment variables:', JSON.stringify({
      AWS_REGION: process.env.AWS_REGION,
      LINKS_TABLE: process.env.LINKS_TABLE
    }));
    
    console.log('Request body:', event.body);
    const { isValid, data, error } = validateRequestBody(event.body, schema);
    if (!isValid) {
      console.log('Validation error:', JSON.stringify(error));
      return error;
    }
    
    // Use nanoid after it's been imported
    const { originalUrl, shortCode = nanoid(8), expiresAt } = data;
    
    // Check if shortCode already exists
    console.log('Checking if shortCode exists:', shortCode);
    try {
      const existingLink = await getLink(shortCode);
      console.log('Existing link check result:', existingLink);
      if (existingLink) {
        return generateResponse(409, {
          message: 'Short code already in use',
          code: 'SHORTCODE_CONFLICT'
        });
      }
    } catch (error) {
      console.error('Error checking existing link:', error);
      throw error;
    }
    
    // Create the link
    console.log('Creating link with data:', { shortCode, originalUrl, expiresAt });
    const linkData = {
      shortCode,
      originalUrl,
      expiresAt,
      createdAt: new Date().toISOString(),
      clicks: 0
    };
    console.log('Link data:', linkData);
    const link = await createLink(linkData);

    return generateResponse(201, {
      message: 'Link created successfully',
      data: link
    });
  } catch (error) {
    console.error('Error creating link:', error);
    console.error('Error stack:', error.stack);
    
    if (error.message === 'Short code already exists') {
      return generateResponse(409, {
        message: 'Short code is already in use',
        code: 'SHORT_CODE_EXISTS'
      });
    }

    return generateResponse(500, {
      message: 'Failed to create link',
      error: error.message
    });
  }
};
