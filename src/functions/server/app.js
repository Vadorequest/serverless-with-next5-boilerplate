import path from 'path';
import express from 'express';
import next from "next";
import compression from 'compression';
import awsServerlessExpressMiddleware from 'aws-serverless-express/middleware';
import proxy from 'express-http-proxy';

import {isHostedOnAWS} from "../../utils/aws";

// XXX next.dev enables HMR, which we don't want if not in development mode, or when we are on AWS's infrastructure
const nextAppConfig = {
  dev: !isHostedOnAWS() && process.env.NODE_ENV === 'development',
  // dir: process.env.NODE_ENV === 'development' ? './../../../' : '.', // Attempt to fix Next.js app in "development" stage, which failed. Used a proxy instead.
  // conf: require('./../../../next.config.js')
};
const nextApp = next(nextAppConfig);

const nextProxy = nextApp.getRequestHandler(); // Requests handled by nextProxy will be handled by the Next.js app
const app = express();

app.use(compression()); // See https://github.com/expressjs/compression/issues/133
app.use(awsServerlessExpressMiddleware.eventContext());

// Routes
app.get('/ko', (req, res) => {
  console.log('req from', req.protocol + '://' + req.get('host') + req.originalUrl);
  res.json({
    status: 'ko'
  })
});

app.get('/event', (req, res) => {
  console.log('req from', req.protocol + '://' + req.get('host') + req.originalUrl);
  res.json(req.apiGateway.event)
});

app.get('/static/:filename', (req, res) => {
  console.log('req from', req.protocol + '://' + req.get('host') + req.originalUrl);
  const filepath = path.resolve(`${__dirname}/../../../static/${req.params.filename}`);
  res.sendFile(filepath)
});

app.get('/:level1/:level2', (req, res) => {
  console.log('req from', req.protocol + '://' + req.get('host') + req.originalUrl);
  res.json({
    level1: req.params.level1,
    level2: req.params.level2,
  })
});

if(!isHostedOnAWS()) {
  // XXX In local environment, we proxy all OTHER requests to Next.js application (because nextProxy fails for some reasons, probably due to b)
  app.use('/', proxy('http://localhost:3001')); // The location of this line is very important, if used at the beginning of the file, then all requests will be affected
} else {
  // XXX In AWS environment, we use the native nextProxy to handle the request
  app.get('*', (req, res) => {
    console.log('req from', req.protocol + '://' + req.get('host') + req.originalUrl);
    nextProxy(req, res);
  });
}

module.exports = app;
