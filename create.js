import uuid from "uuid";
import AWS from "aws-sdk";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export function main(event, context, callback) {
    // Request body is passed in as a JSON encoded string in 'event.body'
    const data = JSON.parse(event.body);

    const params = {
        TableName: process.env.tableName,
        // 'Item' contains the attributes of the item to be created
        // 'userId': user id comes from Cognito Id Pool
        // 'noteId': uuid
        // 'content': parsed from request.body
        // 'attachment': parsed from request.body
        // 'createdAt'¨

        Item: {
            userId: event.requestContext.identity.cognitoIdentityId,
            noteId: uuid.v1(),
            content: data.content,
            attachment: data.attachment,
            createdAt: Date.now()
        }
    };
    dynamoDb.put(params, (error, data) => {
        // Set response headers to enable CORS (Cross-Origin Resource Sharing)
        const headers = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true
        };

        // Return status code 500 on error
        if (error) {
            const response = {
                statusCode: 500,
                header: headers,
                body: JSON.stringify({ status: false })
            };
            callback(null, response)
            return;
        }

        // Return status code 200 and the newly created  item
        const response = {
            statusCode: 200,
            header: headers,
            body: JSON.stringify(params.Item)
        };
        callback(null, response);
    });
}