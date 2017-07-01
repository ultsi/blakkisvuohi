'use strict';

let utils = {};
let when = require('when');

function createSendPrivateMsgFunction(msg) {
  return function(text) {
    let deferred = when.defer();
    global.bot.sendMessage(msg.from.id, text)
    .then(function () {
      console.log('sent ' + text + ' to ' + msg.from.username);
      deferred.resolve();
    }, function(err) {
      console.error('couldn\'t send private msg! Err: ' + err);
      deferred.reject(err);
    });
    return deferred.promise;
  };
}

function createSendChatMsgFunction(msg) {
  return function(text) {
    let deferred = when.defer();
    global.bot.sendMessage(msg.chat.id, text)
    .then(function () {
      console.log('sent ' + text + ' to chat ' + msg.chat.title);
      deferred.resolve();
    }, function(err) {
      console.error('couldn\'t send chat msg! Err: ' + err);
      deferred.reject(err);
    });
    return deferred.promise;
  };
}

utils.attachMethods = function attachMethods(msg) {
  msg.sendPrivateMsg = createSendPrivateMsgFunction(msg);
  msg.sendChatMsg = createSendChatMsgFunction(msg);
};

utils.isValidNumber = function(num){
  return parseInt(num, 10) !== 'NaN';
};

module.exports = utils;
