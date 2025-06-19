const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, DeleteCommand, QueryCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const region = process.env.TARGET_AWS_REGION || 'us-east-1';

const client = new DynamoDBClient({
  region
});

console.log('DynamoDB client initialized with region:', region);
console.log('LINKS_TABLE environment variable:', process.env.LINKS_TABLE);

const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.LINKS_TABLE;

async function getLink(shortCode) {
  const params = {
    TableName: TABLE_NAME,
    Key: { shortCode }
  };

  try {
    const { Item } = await docClient.send(new GetCommand(params));
    return Item;
  } catch (error) {
    console.error('Error getting link:', error);
    throw error;
  }
}

async function createLink(linkData) {
  const params = {
    TableName: TABLE_NAME,
    Item: linkData,
    ConditionExpression: 'attribute_not_exists(shortCode)'
  };

  try {
    await docClient.send(new PutCommand(params));
    return linkData;
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') {
      throw new Error('Short code already exists');
    }
    console.error('Error creating link:', error);
    throw error;
  }
}

async function updateLink(shortCode, updates) {
  const updateExpressions = [];
  const expressionAttributeValues = {};
  const expressionAttributeNames = {};

  Object.entries(updates).forEach(([key, value], index) => {
    const attrName = `#attr${index}`;
    const attrValue = `:val${index}`;
    
    updateExpressions.push(`${attrName} = ${attrValue}`);
    expressionAttributeNames[attrName] = key;
    expressionAttributeValues[attrValue] = value;
  });

  const params = {
    TableName: TABLE_NAME,
    Key: { shortCode },
    UpdateExpression: `SET ${updateExpressions.join(', ')}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW'
  };

  try {
    const { Attributes } = await docClient.send(new UpdateCommand(params));
    return Attributes;
  } catch (error) {
    console.error('Error updating link:', error);
    throw error;
  }
}

async function deleteLink(shortCode) {
  const params = {
    TableName: TABLE_NAME,
    Key: { shortCode },
    ReturnValues: 'ALL_OLD'
  };

  try {
    const { Attributes } = await docClient.send(new DeleteCommand(params));
    return Attributes;
  } catch (error) {
    console.error('Error deleting link:', error);
    throw error;
  }
}

async function listLinks(limit = 10, lastEvaluatedKey = null) {
  const params = {
    TableName: TABLE_NAME,
    Limit: limit,
    ScanIndexForward: false
  };

  if (lastEvaluatedKey) {
    params.ExclusiveStartKey = { shortCode: lastEvaluatedKey };
  }

  try {
    // Using scan since we don't have a userId to query by
    const { Items, LastEvaluatedKey } = await docClient.send(new ScanCommand(params));
    return {
      items: Items || [],
      lastEvaluatedKey: LastEvaluatedKey ? LastEvaluatedKey.shortCode : null
    };
  } catch (error) {
    console.error('Error listing links:', error);
    throw error;
  }
}

async function incrementClicks(shortCode) {
  const params = {
    TableName: TABLE_NAME,
    Key: { shortCode },
    UpdateExpression: 'SET clickCount = if_not_exists(clickCount, :zero) + :incr',
    ExpressionAttributeValues: {
      ':incr': 1,
      ':zero': 0
    },
    ReturnValues: 'UPDATED_NEW'
  };

  try {
    await docClient.send(new UpdateCommand(params));
  } catch (error) {
    console.error('Error incrementing click count:', error);
    throw error;
  }
}

module.exports = {
  getLink,
  createLink,
  updateLink,
  deleteLink,
  listLinks,
  incrementClicks
};
