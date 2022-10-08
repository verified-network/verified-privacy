import {sleep} from '.';

export async function retryPromiseWithDelay(
  promise,
  retryCount,
  delayTime
) {
  try {
    return await promise;
  } catch (e) {
    if (retryCount === 1) {
      return Promise.reject(e);
    }
    console.log('retrying promise', retryCount, 'time');
    // wait for delayTime amount of time before calling this method again
    await sleep(delayTime);
    return retryPromiseWithDelay(promise, retryCount - 1, delayTime);
  }
}

export async function tryPromiseWithTimeout(
  promise,
  timeout
) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(reject, timeout)),
  ]);
}
