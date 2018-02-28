import get from "lodash.get";
import StackTrace from "stacktrace-js";

/**
 * Try using StackTrace for better stacktrace which handles source maps.
 * Fallback to basic error.message when failing with StackTrace.
 *
 * @param error Error to be traced
 * @param result  Optional object that will get injected "error" and "stacktrace" if injectIntoResult is true
 * @param options Additional options for granular logging control
 * @returns {Promise<{}>}
 */
export const trace = async (
  error,
  result = {},
  options = {
    logConsole: true, // Whether log into the console or not
    injectIntoResult: false // Whether injecting data to "result" object or not
  }
) => {
  try {
    const stackTrace = await StackTrace.fromError(error);
    const mainStack = stackTrace[0];

    if(options.logConsole) {
      console.error('error', error);
      console.error('stackTrace', mainStack);
    }
    if(options.injectIntoResult) {
      result.error = get(error, 'message', error);
      result.stackTrace = mainStack;
    }

  } catch (stackTraceError) {
    if(options.logConsole) {
      // Using StackTrace failed, need full stack trace for further debug.
      console.error('error', error);
    }

    if(options.injectIntoResult) {
      result.errorMessage = error.toString(); // Handle weird case like Infinity and such
      result.error = error;
    }
  }

  return result;
};