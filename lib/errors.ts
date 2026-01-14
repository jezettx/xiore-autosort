/**
 * Error handling utilities
 */

/**
 * getErrorMessage - Extract error message dari unknown error
 * @param err - Unknown error object
 * @returns Error message string
 */
export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    return err.message;
  }
  if (typeof err === 'string') {
    return err;
  }
  if (typeof err === 'object' && err !== null && 'message' in err) {
    const msgObj = err as { message: unknown };
    if (typeof msgObj.message === 'string') {
      return msgObj.message;
    }
  }
  return 'Unknown error';
}

/**
 * toErrorObject - Convert unknown error to simple error object
 * @param err - Unknown error
 * @returns Object dengan message property
 */
export function toErrorObject(err: unknown): { message: string } {
  return {
    message: getErrorMessage(err),
  };
}
