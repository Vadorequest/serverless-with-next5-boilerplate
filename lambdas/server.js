import next from 'next';
import es from 'aws-serverless-express';

import { failure } from "../utils/browserResponse";
import { isHostedOnAWS } from "../utils/aws";

// XXX next.dev enabled HMR, which we don't want if not in development mode, or when we are on AWS's infrastructure
const app = next({ dev: !isHostedOnAWS() && process.env.NODE_ENV === 'development' });
const server = es.createServer(app.getRequestHandler());

export async function handler(event, context, callback) {
  try {
    // NOTE: aws-serverless-express uses context.succeed, but AWS already
    // deprecated it in favor of callback
    const fakeContext = {
      succeed: res => callback(null, res)
    };
    app.prepare().then(() => es.proxy(server, event, fakeContext))
  } catch (e) {
    callback(null, await failure({ status: false }, e));
  }
}

