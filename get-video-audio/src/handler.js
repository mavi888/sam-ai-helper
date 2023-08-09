'use strict';

const { makeVideo } = require('./makeVideo');

exports.handler = async (event) => {
	console.log('start making video');
	console.log(event);

	const videoFileName = getVideoName(event.detail.object.key);
	const audioFileName = getAudioFileName(
		event.taskResult.SynthesisTask.OutputUri
	);

	const newVideoName = await makeVideo(videoFileName, audioFileName);

	return {
		newVideoName,
		region: process.env.AWS_REGION,
	};
};

const getVideoName = (key) => {
	//input: 'validated/kinesis.txt'
	//output: 'kinesis.txt'
	const removeValidated = key.split('/')[1];
	console.log(removeValidated);

	//output: kinesis.mp4
	const originalName = `${removeValidated.split('.')[0]}.mp4`;
	console.log(originalName);

	return originalName;
};

const getAudioFileName = (uri) => {
	//get the last part of the uri
	//input: https://s3.eu-west-1.amazonaws.com/bucket-eu-west-1-audiotext/audio.2b9e1acf-7589-4c08-91d1-cd966fb3
	//output: audio.2b9e1acf-7589-4c08-91d1-cd966fb3.mp3
	const lastPart = uri.split('/').pop();

	console.log(lastPart);

	return lastPart;
};
