'use strict';

let utils = {};

function createSendPrivateMsgFunction(msg) {
  return function(text) {
    global.bot.sendMessage(msg.from.id, text)
    .then(function () {
      console.log('sent ' + text + ' to ' + msg.from.username);
    }, function(err) {
      console.error('couldn\'t send confirmation of updated text! Err: ' + err);
    });
  };
}

function createSendChatMsgFunction(msg) {
  return function(msg, text) {
    global.bot.sendMessage(msg.chat.id, text)
    .then(function () {
      console.log('sent ' + text + ' to chat ' + msg.chat.title);
    }, function(err) {
      console.error('couldn\'t send confirmation of updated text! Err: ' + err);
    });
  };
}

utils.attachMethods = function attachMethods(msg) {
  msg.sendPrivateMsg = createSendPrivateMsgFunction(msg);
  msg.sendChatMsg = createSendChatMsgFunction(msg);
};

utils.isValidNumber = function(num){
  return parseInt(num, 10) !== 'NaN';
};

utils.sendPrivateMsg = function(msg, text) {
  global.bot.sendMessage(msg.from.id, text)
  .then(function () {
    console.log('sent ' + text + ' to ' + msg.from.username);
  }, function(err) {
    console.error('couldn\'t send confirmation of updated text! Err: ' + err);
  });
};

utils.sendMsg = function(msg, text) {
  global.bot.sendMessage(msg.chat.id, text)
  .then(function () {
    console.log('sent ' + text + ' to ' + msg.from.username);
  }, function(err) {
    console.error('couldn\'t send confirmation of updated text! Err: ' + err);
  });
};

module.exports = utils;
