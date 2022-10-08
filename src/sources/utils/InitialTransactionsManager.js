let started = false;

const queue = [];

function enqueue(entry) {
  queue.push(entry);
}

function isEmpty() {
  return queue.length === 0;
}

function top() {
  return !isEmpty() ? queue[0] : undefined;
}

function dequeue() {
  return queue.shift();
}

function consume() {
  if (!isEmpty()) {
    const current = top();

    current()
        .then(() => {
          dequeue();
          consume();
        })
        .catch((e) => {
          console.log('Initial transaction fail: ', current, e);
          dequeue();
          consume();
        });
  } else {
    started = false;
  }
}

function addTransaction(transactionFn) {
  enqueue(transactionFn);

  if (started) {
    return;
  }

  started = true;

  consume();
}

export default {
  addTransaction,
};

