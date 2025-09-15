const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');

// Initialize DynamoDB client
const client = new DynamoDBClient({});
const dynamoDB = DynamoDBDocumentClient.from(client);

// Table name for storing emails
const TABLE_NAME = 'EmailSubscribers_Prelaunch';

// Lambda handler function
exports.handler = async (event) => {
    // Set up CORS headers for all responses
    const headers = {
        'Access-Control-Allow-Origin': 'https://www.ulo.social',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'OPTIONS,POST',
        'Access-Control-Allow-Credentials': 'true',
        'Content-Type': 'application/json'
    };
    
    // Handle OPTIONS request (preflight CORS)
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }
    
    // Only accept POST requests for email submission
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ success: false, message: 'Method not allowed' })
        };
    }
    
    try {
        // Parse the request body
        let requestBody;
        try {
            requestBody = JSON.parse(event.body);
        } catch (error) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ success: false, message: 'Invalid request body' })
            };
        }
        
        // Extract email from request
        const email = requestBody.email?.toLowerCase().trim();
        
        // Validate email
        if (!email || !isValidEmail(email)) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ success: false, message: 'Invalid email address' })
            };
        }
        
        // Check if email already exists in DynamoDB
        try {
            const existingItem = await dynamoDB.send(new GetCommand({
                TableName: TABLE_NAME,
                Key: { email }
            }));
            
            if (existingItem.Item) {
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({ 
                        success: true, 
                        message: 'Email already registered' 
                    })
                };
            }
        } catch (dbError) {
            console.error('Error checking existing email:', dbError);
            // Continue with operation even if check fails
        }
        
        // Store email in DynamoDB
        await dynamoDB.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: {
                email,
                registrationDate: new Date().toISOString(),
                source: 'website',
                termsAccepted: true
            }
        }));
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                success: true, 
                message: 'Thank you for registering! We will notify you on app store release!' 
            })
        };
        
    } catch (error) {
        console.error('Error processing request:', error);
        
        // Return error response
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                success: false, 
                message: 'Server error, please try again later' 
            })
        };
    }
};

// Helper function to validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}