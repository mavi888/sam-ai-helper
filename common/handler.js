'use strict';

const AWS = require('aws-sdk');
const s3 = new AWS.S3();

exports.getSignedURL = async (event) => {
	console.log(event);

	const outputuri = event.uri;

	const elements = outputuri.split('/');
	const bucket = elements[3];
	const key = elements[4];

	const params = {
		Bucket: bucket,
		Key: key,
	};

	const signedUrl = await s3.getSignedUrlPromise('getObject', params);
	console.log(signedUrl);

	return signedUrl;
};
