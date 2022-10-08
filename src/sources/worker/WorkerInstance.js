const worker = new Worker('sources/worker/EntriesWorker.js', {type: 'module'});

function init(userPrivateKey) {
  worker.postMessage({
    action: 'init',
    data: {
      privateKey: userPrivateKey,
    },
  });
}

function sync() {
  worker.postMessage({
    action: 'sync',
    data: {},
  });
}

function addCashIssueRequestEntry(issuerAddress, payment) {
  const event = {
    name: 'CashIssueRequestWithFiat',
    payment,
    issuerAddress: issuerAddress,
  };

  worker.postMessage({
    action: 'add_event',
    data: {
      event,
    },
  });
}

function addWithdrawalRequestEntry(payment) {
  const event = {
    name: 'WithdrawalOfFiatRequest',
    payment,
  };

  worker.postMessage({
    action: 'add_event',
    data: {
      event,
    },
  });
}

function addPayInOfFiatCallEntry(data) {
  const event = {
    name: 'PayInOfFiatCall',
    data,
  };

  worker.postMessage({
    action: 'add_event',
    data: {
      event,
    },
  });
}

function setPostedEntries(entries) {
  worker.postMessage({
    action: 'setPostedEntries',
    data: {
      entries,
    },
  });
}

function onEntryPosted(callback){
  worker.onmessage = function(e) {
    callback(e.data.logId);
  }
}

export default {
  init,
  sync,
  addCashIssueRequestEntry,
  addWithdrawalRequestEntry,
  addPayInOfFiatCallEntry,
  setPostedEntries,
  onEntryPosted
};

