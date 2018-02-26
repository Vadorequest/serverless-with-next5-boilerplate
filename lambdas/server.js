// LAMBDA_TASK_ROOT is "/var/task" when hosted on AWS
// AWS_EXECUTION_ENV is "AWS_Lambda_nodejs6.10" when hosted on AWS
const isHostedOnAWS = !!(process.env.LAMBDA_TASK_ROOT || process.env.AWS_EXECUTION_ENV);
const next = require('next');
const es = require('aws-serverless-express');

// XXX next.dev enabled HMR, which we don't want if not in development mode, or when we are on AWS's infrastructure
const app = next({ dev: !isHostedOnAWS && process.env.NODE_ENV === 'development' });
const server = es.createServer(app.getRequestHandler());
// console.log(server)

module.exports.handler = (event, context, callback) => {
  // console.log('event', event)
  // console.log('context', context)
  // NOTE: aws-serverless-express uses context.succeed, but AWS already
  // deprecated it in favor of callback
  const fakeContext = {
    succeed: res => callback(null, res)
  };
  app.prepare().then(() => es.proxy(server, event, fakeContext))
};