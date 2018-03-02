const express = require("express");
import next from 'next';

import { isHostedOnAWS } from "../../utils/aws";

// XXX next.dev enables HMR, which we don't want if not in development mode, or when we are on AWS's infrastructure
const app = next({ dev: !isHostedOnAWS() && process.env.NODE_ENV === 'development' });
const handleNextJs = app.getRequestHandler();

const createServer = () => {
  const server = express();
  // server.use(express.static(__dirname + '../../../public/static'));
  server.get('*', (req, res) => {
    console.log('express *');
    return handleNextJs(req, res);
  });

  return server;
};

module.exports = createServer();

