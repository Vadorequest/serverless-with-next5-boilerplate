import next from 'next';
import es from 'aws-serverless-express';

import { failure } from "../utils/browserResponse";
import { isHostedOnAWS } from "../utils/aws";

// XXX next.dev enabled HMR, which we don't want if not in development mode, or when we are on AWS's infrastructure
const app = next({ dev: !isHostedOnAWS() && process.env.NODE_ENV === 'development' });
const handle = app.getRequestHandler();
const server = es.createServer(handle);

// server.get('*', (req, res) => {
//   console.log('handle')
//   return handle(req, res)
// })

export async function handler(event, context, callback) {
  try {
    return es.proxy(server, event, context);
  } catch (e) {
    callback(null, await failure({ status: false }, e));
  }
}

