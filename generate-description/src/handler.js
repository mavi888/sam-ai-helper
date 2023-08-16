exports.handler = async (event) => {
	console.log(event.body.filecontent);

	const result = {
		description: 'Hello World',
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
