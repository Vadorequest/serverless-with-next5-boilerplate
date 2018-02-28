import path from 'path';

/**
 * Figures whether the project is currently hosted on AWS or not.
 *
 * See https://docs.aws.amazon.com/lambda/latest/dg/current-supported-versions.html
 * @returns {boolean}
 */
export const isHostedOnAWS = () => !!(process.env.LAMBDA_TASK_ROOT || process.env.AWS_EXECUTION_ENV);

/**
 * Resolve project root directory.
 * Works for both local and AWS environments.
 *
 * @param additionalPath
 * @returns {string}
 */
export const resolveProjectRoot = (additionalPath = '') => {
  return path.resolve(__dirname, '..', '..', additionalPath);
};

/**
 * Shortcut/alias to resolve the __dirname absolute path.
 * Works for both local and AWS environments.
 *
 * @param additionalPath Should be "__dirname"
 * @returns {string}
 */
export const absoluteDirname = (additionalPath = '') => {
  return resolveProjectRoot(additionalPath);
};