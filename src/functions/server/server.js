import es from 'aws-serverless-express';

import { failure } from "../../utils/browserResponse";

const server = es.createServer(require('./app'));

export async function handler(event, context, callback) {
  try {
    return es.proxy(server, event, context);
  } catch (e) {
    callback(null, await failure({ status: false }, e));
  }
}

