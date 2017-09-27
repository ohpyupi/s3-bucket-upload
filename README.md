# S3 Bucket Upload

## Instruction
The module is designed to give an easy interface through which a user can save a file in a S3 bucket and retrive a url for the file.
There are two ways to achieve the feature.

(1) Uploading a file directly from an input DOM element to a S3 bucket.
(2) Uploading a base64-formatted file to a S3 bucket.

In case of (1), you will be required to pass input and button DOM elements to initiate event listeners that will upload a file stored in the input element when the button element has been clicked.
Otherwise, through (2) you can transpile the file into a base64-formatted data URI and call uploadBase64() method to upload the data URI to a S3 bucket.

## Installation
```
npm install s3-bucket-upload --save
```

## Configuration
```
import AWS from 'aws-sdk';
import S3Upload from 's3-bucket-upload';

// (1) When you upload a file directly from an input DOM element to a S3 bucket.
let s3Upload = new S3Upload(AWS, {
    Bucket: [String],
    region: [String],
    PoolId: [String],
    IdentityPoolId: [String],
    idToken: [String],
    dirName: [String],
    existingObjectUrl: [String],
    input: [DOM Instance],
    button: [DOM Instance],
    onError: [Function],
    onSuccess: [Function]
});

// (2) When you upload a base64-formatted file to a S3 bucket.
let s3Upload = new S3Upload(AWS, {
    Bucket: [String],
    region: [String],
    PoolId: [String],
    IdentityPoolId: [String],
    idToken: [String],
    dirName: [String],
    existingObjectUrl: [String],
    onError: [Function],
    onSuccess: [Function]
});
s3Upload.uploadBase64(base64=[String], filename=[String], callback=[Function]);
```

## Parameters
#### S3Upload():
- `AWS`: AWS Javascript SDK (required)
- `params`: An object parameter that stores configuration information.
    - `params.Bucket`: AWS S3 bucket unique name.
    - `params.region`: AWS region.
    - `params.PoolId`: AWS Cognito User Pool Id.
    - `params.IdentityPoolId`: AWS Cognito Identity Pool Id.
    - `params.idToken`: AWS Cognito Identity JWT token.
    - `params.dirName`: A directory name where your file will be stored in the S3 bucket.
    - `params.existingObjectUrl`: An exsiting object's url (required only if upating the exsiting one).
    - `params.input`: An input DOM element in which a file will be store. (required only if you are uploading a file directly from an input element.)
    - `params.button`: A button DOM element that will invoke uploading function. (required only if you are uploading a file directly from an input element.)
    - `params.onError`: A callback function to be invoked when the uploading fails.
    - `params.onSuccess`: A callback function to be invoked when the uploading went successful.

#### *public* uploadBase64(base64, filename):
- `base64`: a base64 data URI.
- `filename`: a filename string variable without file extenstions (.png, .jpg, or .gif).
- `callback`: an optional callback. If not passed, `params.onSuccess` and `params.onError` will replace the `callback` function.
