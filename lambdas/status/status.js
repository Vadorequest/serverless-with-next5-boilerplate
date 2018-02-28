import moment from 'moment';
import { isHostedOnAWS, resolveProjectRoot, absoluteDirname } from "../../utils/aws";
import { failure } from "../../utils/browserResponse";

export async function handler(event, context, callback){
  try {
    callback(null, {
      statusCode: 200,
      body: JSON.stringify({
        status: 'running',
        isHostedOnAWS: isHostedOnAWS(),
        aws: {
          region: process.env.AWS_REGION,
          root: process.env.LAMBDA_TASK_ROOT,
          runtimeDir: process.env.LAMBDA_RUNTIME_DIR,
          function: {
            name: process.env.AWS_LAMBDA_FUNCTION_NAME,
            memory: process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE,
            version: process.env.AWS_LAMBDA_FUNCTION_VERSION,
          },
        },
        env: process.env.NODE_ENV,
        time: moment().toISOString(),
        projectRoot: resolveProjectRoot(),
        __dirname: __dirname,
        absoluteDirname: absoluteDirname(__dirname),
      }, null, 2)
    });

  }catch(e){
    callback(null, await failure({ status: false }, e));
  }
}