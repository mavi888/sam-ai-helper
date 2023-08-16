const {
	SecretsManagerClient,
	GetSecretValueCommand,
} = require('@aws-sdk/client-secrets-manager');

const { Configuration, OpenAIApi } = require('openai');

const secretsClient = new SecretsManagerClient({});

exports.handler = async (event) => {
	//console.log(event.body.filecontent);

	const fileContent = event.body.filecontent;

	const description = await getDescriptionUsingOpenAPI(fileContent);

	const result = {
		description: description,
		key: getKeyName(event.detail.object.key),
		region: event.region,
	};

	console.log(result);

	return result;
};

const getKeyName = (key) => {
	//input: 'validated/kinesis.txt'
	//output: 'kinesis.txt'
	const removeValidated = key.split('/')[1];
	console.log(removeValidated);

	return removeValidated;
};

const getDescriptionUsingOpenAPI = async (text) => {
	// Getting the secret from Secret manager
	const openAPISecret = await secretsClient.send(
		new GetSecretValueCommand({
			SecretId: 'open-api-key',
		})
	);

	if (!openAPISecret.SecretString) throw new Error('Failed to get secret');

	const apiKey = openAPISecret.SecretString;

	// Open API
	const openai = new OpenAIApi(
		new Configuration({
			apiKey,
		})
	);

	const prompt = `Write a compelling description for a YouTube video, that is maximum two paragraphs long and has good SEO. Don't focus on the person who is mentioned in the video, just focus on the content of the video. The description should be in the same language as the video.  In addition, can you return 5 different title options for this video. Also provide 20 tags for it, as a list of comma separated values. Please create the response formatted as JSON. Here is the video transcript for you to create this description, titles and tags:${text}`;

	//console.log(prompt);

	const result = await openai.createCompletion({
		model: 'text-davinci-003',
		prompt: prompt,
		max_tokens: 1000,
		temperature: 0.7,
	});

	const description = result.data.choices[0].text;
	console.log(description);

	return description;
};
