import * as awsServerlessExpress from 'aws-serverless-express'

import { failure } from '../../utils/browserResponse'

import * as next from 'next'
import { isHostedOnAWS } from '../../utils/aws'

const port = process.env.PORT ? process.env.PORT : '3000'
const nextOptions = { dev: !isHostedOnAWS }
const app = next(nextOptions)
const handle = app.getRequestHandler()

const server = awsServerlessExpress.createServer((req, res) => {
	console.log(`req from ${req.headers.host}`)
	handle(req, res)
})

export async function handler(event: any, context: any, callback: any) {
	try {
		return awsServerlessExpress.proxy(server, event, context)
	} catch (e) {
		callback(null, await failure({ status: false }, e))
	}
}
