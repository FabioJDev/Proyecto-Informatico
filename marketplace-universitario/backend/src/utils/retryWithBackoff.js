/**
 * Retry with Exponential Backoff (RNF-11)
 *
 * Retries an async function up to `maxRetries` times.
 * Delay between attempts: baseDelay * 2^(attempt - 1) + jitter
 *
 * @param {() => Promise<any>} fn          Async function to execute
 * @param {number}             maxRetries  Max retry attempts (default 3)
 * @param {number}             baseDelay  Base delay in ms (default 1000)
 * @returns {Promise<any>}
 */
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) break;

      // Exponential backoff with jitter
      const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
      const jitter = Math.random() * 200;
      const delay = exponentialDelay + jitter;

      console.warn(
        `[retryWithBackoff] Attempt ${attempt}/${maxRetries} failed. ` +
          `Retrying in ${Math.round(delay)}ms... Error: ${error.message}`
      );

      await sleep(delay);
    }
  }

  throw lastError;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { retryWithBackoff };
