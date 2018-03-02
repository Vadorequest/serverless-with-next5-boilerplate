const serverless = require("serverless-http");
import { failure } from "../../utils/browserResponse";

const appServer = require("./server");
const binaryMimeTypes = [
    "application/javascript",
    "application/json",
    "application/octet-stream",
    "application/xml",
    "binary/octet-stream",
    "image/jpeg",
    "image/png",
    "image/gif",
    "text/comma-separated-values",
    "text/css",
    "text/html",
    "text/javascript",
    "text/plain",
    "text/text",
    "text/xml",
    "image/x-icon",
    "image/svg+xml",
    "application/font-woff2",
    "application/font-woff",
    "font/woff",
    "font/woff2"
];

const handler = serverless(appServer, {
    binary: binaryMimeTypes
});

exports.handler = (event, context, callback) => {
  try {
    console.log('serverless')
    return handler(event, context, callback);
  } catch (e) {
    console.error(e.message)
    // callback(null, await failure({ status: false }, e));
  }
};