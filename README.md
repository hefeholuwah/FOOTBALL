# AWS Mail Notification Service for Football Fixtures

This project implements an AWS-based service that sends daily email notifications about football fixtures for the current day. It utilizes **AWS Lambda**, **EventBridge Scheduler**, and **SNS** to fetch and notify users about the fixtures.

## Features

- Fetches football fixtures for the current day using the [RapidAPI Live Football API](https://rapidapi.com/).
- Sends email notifications to users subscribed to an SNS topic.
- Scheduled daily execution using EventBridge Scheduler.

## Architecture

1. **AWS Lambda**: Contains the main business logic to fetch football fixtures from the API and publish messages to an SNS topic.
2. **AWS SNS**: Distributes the notifications via email to all subscribers.
3. **EventBridge Scheduler**: Triggers the Lambda function daily at a specified time.

---

## Prerequisites

1. An **AWS account** with permissions to create Lambda functions, EventBridge rules, and SNS topics.
2. An API key for the [RapidAPI Live Football API](https://rapidapi.com/).
3. The AWS CLI or AWS Management Console configured with sufficient permissions.

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-repo/football-fixtures-notifier.git
cd football-fixtures-notifier
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure the Environment Variables

Create an `.env` file in the project root and add the following:

```env
RAPIDAPI_HOST=free-api-live-football-data.p.rapidapi.com
RAPIDAPI_KEY=your-rapidapi-key
SNS_TOPIC_ARN=arn:aws:sns:your-region:your-account-id:footballfixtures
```

### 4. Deploy the Lambda Function

Zip the Lambda function and dependencies:

```bash
zip -r lambda-function.zip .
```

Upload the zip file to AWS Lambda using the AWS Management Console or CLI.

---

## IAM Role Permissions

Ensure the Lambda execution role has the following permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "sns:Publish",
      "Resource": "arn:aws:sns:your-region:your-account-id:footballfixtures"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "*"
    }
  ]
}
```

### Trust Relationship

Update the **Trust Relationship** of the Lambda execution role to allow invocation by EventBridge Scheduler:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    },
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "events.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    },
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "scheduler.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

---

## EventBridge Scheduler Setup

1. Navigate to **EventBridge Scheduler** in the AWS Management Console.
2. Create a new schedule with the following configuration:
   - **Target**: Lambda function.
   - **Execution Role**: The role associated with your Lambda function.
   - **Schedule Expression**: Set to run daily (e.g., `cron(0 9 * * ? *)` for 9 AM UTC).

---

## Testing

1. Subscribe an email address to the SNS topic:
   ```bash
   aws sns subscribe --topic-arn arn:aws:sns:your-region:your-account-id:footballfixtures --protocol email --notification-endpoint your-email@example.com
   ```
   Confirm the subscription in your email.

2. Manually invoke the Lambda function for testing:
   ```bash
   aws lambda invoke --function-name your-lambda-function-name response.json
   ```

3. Check the email inbox for notifications.

---

## API Request Details

The Lambda function fetches fixtures from RapidAPI using the following request:

```bash
curl --request GET \
  --url 'https://free-api-live-football-data.p.rapidapi.com/football-get-matches-by-date?date=YYYYMMDD' \
  --header 'X-RapidAPI-Key: your-rapidapi-key' \
  --header 'X-RapidAPI-Host: free-api-live-football-data.p.rapidapi.com'
```

---

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for review.

---

## License

No License
```

---

### Key Points Covered:
1. **Setup instructions** with clear steps.
2. Detailed **IAM role permissions** and **trust relationship** configurations.
3. **API details** and environment variables setup.
4. Testing and deployment instructions.

```