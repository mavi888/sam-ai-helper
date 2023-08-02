'use strict';

const { makeVideo } = require('./makeVideo');

exports.handler = async (event) => {
	console.log('start making video');
	console.log(event);

	const newVideoName = await makeVideo(event);
	return {
		newVideoName,
		region: process.env.AWS_REGION,
	};
};
