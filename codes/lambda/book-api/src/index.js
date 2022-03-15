exports.handle = async function(event, context) {
    console.info('event====>', JSON.stringify(event, undefined, 2));
    
    const resource = event['resource'];
    const path = event['path'];
    const method = event['httpMethod'];
    const body = event['body']
    
    const responseBody = {
        "Result": "Success",
        "Description": `your ${method} for ${resource} is completed`
    };

    const response = {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Headers" : "Content-Type",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
        },
        "body": JSON.stringify(responseBody),
        "isBase64Encoded": false
    };

    return response;
}
