import next from 'next';
import es from 'aws-serverless-express';
// import awsServerlessExpressMiddleware from 'aws-serverless-express/middleware' // TODO Don't know how to use it neither what it may help for

import { failure } from "../../utils/browserResponse";
import { isHostedOnAWS } from "../../utils/aws";

// XXX next.dev enables HMR, which we don't want if not in development mode, or when we are on AWS's infrastructure
const app = next({ dev: !isHostedOnAWS() && process.env.NODE_ENV === 'development' });
const handle = app.getRequestHandler();
const server = es.createServer((req, res) => {
  console.log('req from', req.headers.host);

  handle(req, res);
});

export async function handler(event, context, callback) {
  try {
    return es.proxy(server, event, context);
  } catch (e) {
    callback(null, await failure({ status: false }, e));
  }
}

