const Chance = require('chance');
const moment = require('moment');

let AWS;
let s3;
let Bucket;
let region;
let PoolId;
let IdentityPoolId;
let idToken;
let onSuccess;
let onError;
let dirName;
let existingObjectUrl;

module.exports = class S3Upload {
	constructor(AWS, params={}) {
		// Private properties.
		AWS = AWS;
		Bucket = params.Bucket;
		region = params.region;
		PoolId = params.PoolId;
		IdentityPoolId = params.IdentityPoolId;
		idToken = params.idToken;
		dirName = params.dirName;
		onSuccess = params.onSuccess;
		onError = params.onError;
		existingObjectUrl = params.existingObjectUrl;
		console.log(existingObjectUrl);
		// Public properties.
		this.input = params.input;
		this.button = params.button;
		// Functions to be invoked as initiated.
		configureCredential(AWS, region, PoolId, IdentityPoolId, idToken);
		if (this.input && this.button) {
			initiateEventListeners(this.input, this.button);
		}
	}
	uploadBase64(base64, filename, callback) {
		if (!filename) throw Error('You must pass filename.');
		if (!base64) throw Error('You must pass base64.');
		// If an additional callback has been passed, 
		// [1] Create a file object from base64 data string.
		let file = createFileObjectFromBase64(base64, filename);
		// [2] Upload the file object to the S3 bucket.
		upload(file, Bucket, dirName, existingObjectUrl, function onSuccess(res) {
			// it will replace onSuccess function if callback is provided.
			if (callback) return callback(null, res);
			onSuccess(res);
		}, function onError(err) {
			// it will replace onError function if callback is provided.
			if (callback) return callback(err);
			onError(err);
		});
	}
}

// [1] Configure the AWS with a proper set of credentials through Cognito's id Token.
function configureCredential(AWS, region, PoolId, IdentityPoolId, idToken) {
	AWS.config.region = region;
	AWS.config.credentials = new AWS.CognitoIdentityCredentials({
		IdentityPoolId,
		Logins: {
			[`cognito-idp.${region}.amazonaws.com/${PoolId}`]: idToken, 
		},
	});
	s3 = new AWS.S3();
}

// [2] Add an event listener to the button DOM object.
function initiateEventListeners(input, button) {
	button.addEventListener('click', function onClick() {
		upload(input.files[0], Bucket, dirName, existingObjectUrl, onSuccess, onError);
	}, false);
}

// [3] Upload the file to the S3 bucket.
function upload(file, Bucket, dirName, existingObjectUrl, onSuccess, onError) {
	if (!file) return onError('File must be passed!');
	let now = moment().format('YYYY-MM-DD-HH-MM-SS');
	let random = chance.hash({length: 4});
	let keyName = existingObjectUrl 
		? existingObjectUrl.split('/').splice(4).join('/')
		: `profile/${random}-${now}/${file.name}`;
	let params = {
		Bucket,
		"Key": keyName,
		"ContentType": file.type,
		"Body": file,
		"ACL": "public-read"
	};
	s3.putObject(params, function onUpload(err, res) {
		if (err) return onError(err);
		let result = {
			success: true,
			message: 'Successfully updated!',
			url: `https://s3.amazonaws.com/${Bucket}/${params.Key}`,
		};
		onSuccess(result);
	});
}

// [4] In case of a user's profile in base64 format, it needs to be transpiled into a file object.
function createFileObjectFromBase64(base64, filename) {
	let data = base64.split(',').reduce((sum, value, idx)=>{
		let _tmp = {};
		if (idx < 1) {
			_tmp.type = value.split(';')[0].split(':')[1];
		} else {
			_tmp.buffer = new Buffer(value, 'base64');
		}
		return Object.assign(_tmp, sum);
	}, {});
	let file = new File([data.buffer], `${filename}.${data.type.split('/')[1]}`, {type: data.type});
	return file;
}
