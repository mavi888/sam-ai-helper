'use strict';

// Configure S3
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

// Set paths for ffpmeg/ffprobe depending on local/Lambda usage
const ffmpegPath = process.env.localTest
	? require('@ffmpeg-installer/ffmpeg').path
	: '/opt/bin/ffmpeg';
const ffTmp = process.env.localTest ? './tmp' : '/tmp';

const child_process = require('child_process');

const { uploadToS3 } = require('./uploadToS3');
const { tmpCleanup } = require('./tmpCleanup');

const makeVideo = async (videoFileName, audioFileName) => {
	console.log('start making video');

	// Get settings from the incoming event
	const originalVideo = videoFileName;
	const dubbedAudio = audioFileName;

	// Get signed URL for original video
	const paramsOriginal = {
		Bucket: process.env.OriginalVideoBucketName,
		Key: originalVideo,
	};
	console.log(paramsOriginal);

	const originaVideoSignedUrl = await s3.getSignedUrlPromise(
		'getObject',
		paramsOriginal
	);

	// Get signed URL for dubbed audio
	const paramsAudio = {
		Bucket: process.env.DubbedAudioBucketName,
		Key: dubbedAudio,
	};

	const dubbedAudioSignedUrl = await s3.getSignedUrlPromise(
		'getObject',
		paramsAudio
	);

	console.log('makeVideo: ', {
		originalVideo,
		dubbedAudio,
		originaVideoSignedUrl,
		dubbedAudioSignedUrl,
	});

	// Extract frames from MP4 (1 per second)
	console.log('Replace audio from original video with dubbed audio');

	// Create new dubbed video
	const newVideoName = `${originalVideo}-dubbed.mp4`;
	console.log(newVideoName);

	console.log('start ffmpeg');

	const ffmpegArgsString = `-loglevel error -i ${originaVideoSignedUrl} -i ${dubbedAudioSignedUrl} -vcodec copy -acodec aac -map 0:0 -map 1:0 ${ffTmp}/${newVideoName}`;
	console.log(ffmpegArgsString);

	const ffmpegArgs = ffmpegArgsString.split(' ');
	console.log(ffmpegArgs);

	const proc = child_process.spawnSync(ffmpegPath, ffmpegArgs);
	console.log(proc.stderr.toString());

	// Upload video to s3
	await uploadToS3(newVideoName);

	// Cleanup temp files
	await tmpCleanup();

	return newVideoName;
};

module.exports = { makeVideo };
