const next = require('next')
const es = require('aws-serverless-express')

const app = next({ dev: process.env.NODE_ENV !== 'production' })
const server = es.createServer(app.getRequestHandler())

module.exports.handler = (event, context, callback) => {
  // NOTE: aws-serverless-express uses context.succeed, but AWS already
  // deprecated it in favor of callback
  const fakeContext = {
    succeed: res => callback(null, res)
  }
  app.prepare().then(() => es.proxy(server, event, fakeContext))
}