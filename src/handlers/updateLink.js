const { updateLink, getLink } = require('../utils/db');
const { generateResponse, validateRequestBody } = require('../utils/response');
const { z } = require('zod');

const updateLinkSchema = z.object({
  originalUrl: z.string().url('Invalid URL format').optional(),
  isActive: z.boolean().optional(),
  expiresAt: z.string().datetime().optional().nullable(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional()
}).strict();

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

    // Validate request body
    const { isValid, data: updateData, error } = validateRequestBody(
      event.body,
      updateLinkSchema
    );

    if (!isValid) return error;

    // Only include defined fields in the update
    const updates = {};
    if (updateData.originalUrl !== undefined) updates.originalUrl = updateData.originalUrl;
    if (updateData.isActive !== undefined) updates.isActive = updateData.isActive;
    if ('expiresAt' in updateData) updates.expiresAt = updateData.expiresAt;
    if (updateData.tags !== undefined) updates.tags = updateData.tags;
    if (updateData.metadata !== undefined) updates.metadata = updateData.metadata;
    
    // Add updatedAt timestamp
    updates.updatedAt = new Date().toISOString();

    if (Object.keys(updates).length === 1) { // Only updatedAt was added
      return generateResponse(200, {
        message: 'No updates provided',
        data: existingLink
      });
    }

    const updatedLink = await updateLink(shortCode, updates);

    return generateResponse(200, {
      message: 'Link updated successfully',
      data: updatedLink
    });
  } catch (error) {
    console.error('Error updating link:', error);
    return generateResponse(500, {
      message: 'Failed to update link',
      error: error.message
    });
  }
};
