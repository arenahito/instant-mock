import timer from 'timers';

function waitForCall(sinonObj, timeout = 2000) {
  return waitFor(sinonObj, null, timeout);
}

function waitForCallWith(sinonObj, args, timeout = 2000) {
  return waitFor(sinonObj, args, timeout);
}

async function waitFor(sinonObj, args, timeout) {
  const startTime = new Date();

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (args == null) {
      if (sinonObj.called) {
        return;
      }
    } else if (sinonObj.calledWith(...args)) {
      return;
    }

    if (new Date() - startTime > timeout) {
      throw new Error('timeout');
    }

    // eslint-disable-next-line no-await-in-loop
    await sleep(20);
  }
}

function sleep(time) {
  return new Promise((resolve) => {
    timer.setTimeout(resolve, time);
  });
}

export default {
  waitForCall,
  waitForCallWith,
};
