/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: MIT-0
 */

'use strict';

require('dotenv').config();

// Mock event
const event = require('./testEvent.json');

// Lambda handler
const { handler } = require('./handler');

const main = async () => {
	console.time('localTest');
	console.dir(await handler(event));
	console.timeEnd('localTest');
};

main().catch((error) => console.error(error));
