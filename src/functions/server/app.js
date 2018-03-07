
import path from 'path';
import express from 'express';
import next from "next";
import awsServerlessExpressMiddleware from 'aws-serverless-express/middleware';

import {isHostedOnAWS} from "../../utils/aws";

// XXX next.dev enables HMR, which we don't want if not in development mode, or when we are on AWS's infrastructure
const nextApp = next({ dev: !isHostedOnAWS() && process.env.NODE_ENV === 'development' });

const handle = nextApp.getRequestHandler();
const app = express();

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

app.get('/:group', (req, res) => {
  console.log('req from', req.protocol + '://' + req.get('host') + req.originalUrl);
  res.json({
    group: req.params.group
  })
});

app.get('/:group/:school', (req, res) => {
  console.log('req from', req.protocol + '://' + req.get('host') + req.originalUrl);
  res.json({
    group: req.params.group,
    school: req.params.school,
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
