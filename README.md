# Dubb videos automatically with Serverless and AI

_Infrastructure as code framework used_: AWS SAM
_AWS Services used_: AWS Step Functions, Amazon EventBridge, Amazon S3, AWS Lambda, Amazon Transcribe, Amazon Translate, Amazon Polly, Amazon Bedrock, AWS SNS

## Summary of the demo

This demo will allow you to automatically dubb videos from English to Spanish. You input the original video in an S3 bucket and that will start the process, by the end of the process you will get back a new video dubbed into spanish and a JSON file with a description of the video, title, and tags in the destination language.

In this demo you will see:

- How to build an event-driven serverless application to dubb videos automatically using AI.
- How to trigger state machines when new objects are uploaded to an S3 bucket
- How to build state machines with reusable components and best practices
- How to use AI services from AWS like Amazon Transcribe, Translate, Polly and Bedrock from the state machine.

This demo is part of a video posted in FooBar Serverless channel. You can check the video to see the whole demo.

Important: this application uses various AWS services and there are costs associated with these services after the Free Tier usage - please see the AWS Pricing page for details. You are responsible for any AWS costs incurred. No warranty is implied in this example.

## Architecture

This demo deploys 4 state machines. Each state machine does a different operation.

1. The process start when the user uploads the original video to an S3 bucket. The first state machine starts executing when this ocurrs. This state machine will transcribe the video. Uploads the result into an S3 bucket and send an email with the link of the file by email to the user.

2. When the user recieves the email, they need to validate the transcription and upload the validated version to a new AWS S3 bucket. This triggers a new state machine that does the translation of the validated transcription. Uploads the result into an S3 bucket and sends an email with the link to file by email.

3. The user needs to validate the translation. And when they do, they can upload the validated version to a new S3 bucket. This triggers 2 state machines. The first state machine will create the dubbed video, using AWS Polly and a AWS Lambda function that uses ff-mpeg. Then it will upload the video to S3 and send and email with the link to the user. The second state machine will create the description, tags and titles for the video using Amazon Bedrock, and will upload the resulting JSON in S3 and send an email to the user.

![Architecture diagram](/images/01-system-architecture.png)

## Requirements

- AWS CLI already configured with Administrator permission
- AWS SAM CLI installed - minimum version 1.94.0 (sam --version)
- NodeJS 16.x installed
- Python 3.9 installed
- A Lambda layer with ffmpeg deployed in the same region you are going to deploy your stack. [Check the instructions](https://serverlessrepo.aws.amazon.com/applications/us-east-1/145266761615/ffmpeg-lambda-layer)

## Deploy this demo

To deploy this demo you need to deploy multiple stacks that contain different pieces of the solution:

- `common` stack: the common stack contains all the buckets, SNS topic and reusable Lambda functions.
- `transcribe` stack: this stack deploys the state machine and all the resources needed for the transcribe state machine.
- `translate` stack: this stack deploys the translate state machine and all the resources needed for this state machine.
- `get-video-audio` stack: this stack deploys the dubbing state machine and all the resources needed for this state machine.
- `generate-assets` stack: this stack deploys the state machine that generates titles, descriptions, and tags and all the resources needed for this state machine.

Some considerations:

- To deploy these stacks you first need to deploy the `common` stack and get all the resources names and ARNs as you will need them in the deployment of the other stacks.
- The order in which you deploy the other stacks is not important.
- For now due to Region limitations with Amazon Bedrock make sure that you deploy this application in a Region in which Amazon Bedrock is available (eg us-east-1)
- The `generate-assets` stack needs to be build before deployed.

All the stacks get deployed with this command for the first time.

```
sam deploy -g # Guided deployments
```

When asked about functions that may not have authorization defined, answer (y)es. The access to those functions will be open to anyone, so keep the app deployed only for the time you need this demo running.

You will be asked for many parameters when you deploy the stacks.

Next times, when you update the code, you can build and deploy with:

```
sam deploy
```

To delete the app:

```
sam delete
```

## Testing this application

You can test this solution from the terminal and your email, no need to go to the AWS Console, but if you want to see how the different state machines work you can check them out in the Console.

1. The first step is to upload a video to the `VideoBucket`.

```
aws s3 cp <file> s3://bucket-XXXX-input-video/
```

When the file finish uploading it will trigger the transcription state machine and you will recieve an email with the transcription file.

2. Validate the transcription file. Make sure that the transcription is correct, or fix any issue with the transcription. This will improve the quality of the end result.

When you are ready you can upload the file to the transcribed bucket.

```
aws s3 cp <file> s3://bucket-XXXX-transcribed/validated/
```

When the file finish uploading it will trigger the translation state machine and you will recieve an email with the translation file.

3. Validate the translation file. Make sure that everything is translated correctly. This will improve the quality of the end result.

When you are ready you can upload the file to the translated bucket.

NOTE: It is important that the name of this file, matches the original file name. For example: original name "kinesis.mp4" and the translated file name "kinesis.txt".

```
aws s3 cp <file> s3://bucket-XXXX-translate/validated/
```

When the file finish uploading it will trigger the dubbed state machine and you will recieve an email with the final video file.

Also the state machine will trigger the generate assests state machine and you will recieve an email with the titles, descriptions and tags.

## Links related to this code

- Video with more details:
- Launch blog post:
