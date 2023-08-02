/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: MIT-0
 */

'use strict';

// Configure S3
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

const fs = require('fs');
const path = require('path');
const directory = process.env.localTest ? './tmp/' : '/tmp/';

const uploadToS3 = async (fileName) => {
	const params = {
		Bucket: process.env.ResultBucketName,
		Key: `${fileName}`,
		Body: fs.readFileSync(path.join(directory, fileName)),
	};
	console.log(params);

	return await s3.putObject(params).promise();
};

module.exports = { uploadToS3 };
