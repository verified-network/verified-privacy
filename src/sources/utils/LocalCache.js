// FIXME: change this numbers, it is only for testing
const DEFAULT_EXPIRE_TIME_IN_SECONDS = 3600;
// const DEFAULT_EXPIRE_TIME_IN_SECONDS = 360000000;

function removeItem(key) {
  localStorage.removeItem('cache_' + key);
}

function setItem(key, value, expires = DEFAULT_EXPIRE_TIME_IN_SECONDS) {
  const date = new Date();
  const schedule = Math.round((date.setSeconds(date.getSeconds() + expires)) / 1000);

  const item = {
    value,
    expire: schedule,
  };

  localStorage.setItem('cache_' + key, JSON.stringify(item));
}

function getItem(key) {
  const item = JSON.parse(localStorage.getItem('cache_' + key));

  if (!item) {
    return null;
  }

  const currentTime = Math.round((new Date()).getTime() / 1000);
  const storedTime = parseInt(item['expire']);

  if (storedTime < currentTime) {
    removeItem(key);

    return null;
  } else {
    return item['value'];
  }
}

function itemExists(key) {
  return !!getItem(key);
}

function clear() {
  for (const key in localStorage) {
    if (key.startsWith('cache_')) {
      localStorage.removeItem(key);
    }
  }
}

export default {
  getItem,
  setItem,
  itemExists,
  clear,
};
