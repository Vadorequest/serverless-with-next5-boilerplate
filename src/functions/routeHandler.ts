import * as express from 'express'
import * as next from 'next'

import { isHostedOnAWS } from '../utils/aws'

const port = process.env.PORT ? process.env.PORT : '3000'
const nextOptions = { dev: !isHostedOnAWS }
const app = next(nextOptions)
const handle = app.getRequestHandler()

function createServer(req: any, res: any) {
	console.log(`req from ${req.headers.host}`)
	handle(req, res)
}

if (!isHostedOnAWS) {
	app.prepare().then(() => {
		const server = express()
		server.get('*', (req, res) => handle(req, res))
		server.listen(3000)
		console.log(`> Ready on http://localhost:${port}`)
	})
}

export default createServer
