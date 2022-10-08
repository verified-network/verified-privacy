/* eslint-disable */

import {VerifiedWallet} from '@verified-network/verified-sdk';
import AccountContractService from 'sources/contracts/AccountContractService';
import Config from 'sources/Config';
import Events from './Events';
import TransactionEntriesBuilder from 'sources/worker/TransactionEntries';

let started = false;

const queue = [];
let accountContract = null;
let transactionEntriesBuilder = null;
let eventsFetcher = null;
let alreadyPostedEntries = [];

function addTransaction(entry) {
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

    if(current.event && current.event.logId && alreadyPostedEntries.includes(current.event.logId)){
      console.log("Already posted event:", current);

      dequeue();
      consume();
      return;
    }

    accountContract.postEntry(current)
      .then((postResponse) => {
        return accountContract
          .getBlockNumber()
          .then((currentBlock) => {
            console.log('Current entry block cursor: ', currentBlock);

            const eventBlock = current.event.blockNumber;

            if (eventBlock !== currentBlock) {
              return accountContract.setBlockNumber(eventBlock.toString())
                .then(() => {
                  return postResponse;
                })
            }else{
              return Promise.resolve();
            }
          })
          .then((postResponse) => {
            console.log('Success posted entry: ', current);
            console.log('Posting response: ', postResponse);

            if(current.event && current.event.logId){
              sendPostedEntry(current.event.logId);
            }

            dequeue();
            consume();
          });
      })
      .catch((e) => {
        console.log('Fail posting entry: ', current, e);
        consume();
      });
  }
}

addEventListener('message', (e) => {
  const message = e.data;

  switch (message.action) {
    case 'init': {
      if (started) {
        return;
      }

      console.log('Init worker done');

      started = true;

      const privateKey = message.data.privateKey;
      const wallet = new VerifiedWallet(privateKey, Config.privateProvider);

      accountContract = new AccountContractService(wallet);
      transactionEntriesBuilder = new TransactionEntriesBuilder(wallet);
      eventsFetcher = new Events(wallet);

      break;
    }

    case 'sync': {
      return accountContract
        .getBlockNumber()
        .then((currentEntryBlockNumber) => parseInt(currentEntryBlockNumber))
        .then(currentEntryBlockNumber => {
          eventsFetcher.fetchNotEnteredEvents(currentEntryBlockNumber, '').then((events) => {
            const entries = [];

            console.log('Events: ', events);

            for (const event of events) {
              entries.push(...transactionEntriesBuilder.buildEntriesByEvent(event));
            }

            console.log('Entries: ', entries);

            for (const entry of entries) {
              addTransaction(entry);
            }

            consume(); //Fixme: Uncomment it, it is just commented for testing
          });
        });

      break;
    }

    case 'add_event': {
      const event = message.data.event;

      const entries = transactionEntriesBuilder.buildEntriesByEvent(event);

      console.log('Entries: ', entries);

      for (const entry of entries) {
        addTransaction(entry);
      }

      break;
    }

    case 'setPostedEntries': {
      alreadyPostedEntries = message.data.entries;
      break;
    }

  }
});

function sendPostedEntry(logId) {
  postMessage({
    logId
  });
}
