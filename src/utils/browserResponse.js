import { trace } from './logging';

/**
 * Failure response
 *
 * @param body  Body to be returned to the browser
 * @param error Error object to be logged
 * @param props Dynamic properties sent to the browser (except "body")
 * @returns {Promise<*>}
 *
 * @example callback(null, await failure({ status: false }, e)); // where "e" is an Error
 */
export const failure = async (body, error, props = { statusCode: 500 }) => {
  return {
    ...props,
    body: await trace(error, body, {
      logConsole: true,
      injectIntoResult: process.env.NODE_ENV !== 'production',
    }),
  }
};