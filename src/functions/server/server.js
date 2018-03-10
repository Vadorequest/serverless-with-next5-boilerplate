import es from 'aws-serverless-express';

import { failure } from "../../utils/browserResponse";

// XXX Treat some MIME types as Binary format, see https://github.com/awslabs/aws-serverless-express/issues/131
// Necessary to correctly display png/jpg because they are sent as binary data from API Gateway.

// XXX If you get ERR_CONTENT_DECODING_FAILED in your browser, this is likely due to a compressed response (e.g. gzip)
// which has not been handled correctly by aws-serverless-express and/or API Gateway.
// Just add the necessary MIME types below
const binaryMimeTypes = [
  'application/javascript',
  'application/json',
  'application/octet-stream',
  'application/xml',
  'font/eot',
  'font/opentype',
  'font/otf',
  'image/jpeg',
  'image/png',
  'image/svg+xml',
  'text/event-stream',
  'text/comma-separated-values',
  'text/css',
  'text/html',
  'text/javascript',
  'text/plain',
  'text/text',
  'text/xml'
];

const server = es.createServer(require('./app'), null, binaryMimeTypes);

export async function handler(event, context, callback) {
  try {
    return es.proxy(server, event, context);
  } catch (e) {
    callback(null, await failure({ status: false }, e));
  }
}

