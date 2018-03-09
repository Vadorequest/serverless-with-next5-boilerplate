import path from 'path';
import express from 'express';
import next from "next";
import compression from 'compression';
import awsServerlessExpressMiddleware from 'aws-serverless-express/middleware';

import {isHostedOnAWS} from "../../utils/aws";

// XXX next.dev enables HMR, which we don't want if not in development mode, or when we are on AWS's infrastructure
const nextApp = next({ dev: !isHostedOnAWS() && process.env.NODE_ENV === 'development' });

const handle = nextApp.getRequestHandler();
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
  console.log(filepath)
  res.sendFile(filepath)
});

app.get('/:level1', (req, res) => {
  console.log('req from', req.protocol + '://' + req.get('host') + req.originalUrl);
  res.json({
    level1: req.params.level1
  })
});

app.get('/:level1/:level2', (req, res) => {
  console.log('req from', req.protocol + '://' + req.get('host') + req.originalUrl);
  res.json({
    level1: req.params.level1,
    level2: req.params.level2,
  })
});

app.get('*', (req, res) => {
  console.log('req from', req.protocol + '://' + req.get('host') + req.originalUrl);
  handle(req, res);
});

if(!isHostedOnAWS() && process.env.NODE_ENV === 'development'){
  app.listen(3000, (err) => {
    if (err) throw err;
    console.log('Server ready on http://localhost:3000');
  });
}

module.exports = app;
