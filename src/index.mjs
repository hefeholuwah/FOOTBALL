import AWS from 'aws-sdk';
import fetch from 'node-fetch';

// Initialize SNS
const sns = new AWS.SNS();

export const handler = async (event) => {
  try {
    // API endpoint and headers
    const apiEndpoint = 'https://free-api-live-football-data.p.rapidapi.com/football-get-matches-by-date';
    const rapidApiHost = process.env.RAPID_HOST;
    const apiKey = process.env.RAPIDAPI_KEY;

    // Get today's date and format the date to give YYYYMMDD 
    const today = new Date();
    const formattedDate = `${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}`;

    // Construct the URL with the current date
    const url = `${apiEndpoint}?date=${formattedDate}`;

    // Make API request
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Host': rapidApiHost,
        'X-RapidAPI-Key': apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("API Response:", JSON.stringify(data, null, 2)); // Log the full response

    // Process the matches data
    const matches = data.response?.matches || []; // Access nested matches

    if (matches.length === 0) {
      console.log(`No matches found for ${formattedDate}`);
      return {
        statusCode: 200,
        body: JSON.stringify({ message: `No matches available for ${formattedDate}` }),
      };
    }

    // Prepare the notification message
    const message = `Matches on ${formattedDate}:\n` +
      matches.map(match => `${match.home.name} vs ${match.away.name} at ${match.time}`).join('\n');

    // Publish message to SNS
    const params = {
      Message: message,
      TopicArn: process.env.SNS_TOPIC_ARN,
    };

    const result = await sns.publish(params).promise();

    console.log(`Message sent successfully: ${result.MessageId}`);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Notification sent successfully" }),
    };
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to send notification", details: error.message }),
    };
  }
};