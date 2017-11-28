'use strict';

let utils = {};
let when = require('when');

utils.getDateMinusHours = function(hours) {
  const hourInMillis = 3600*1000;
  const hoursAgo = new Date(Date.now()-hours*hourInMillis);
  return hoursAgo;
};

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
      console.error('couldn\'t send chat msg! Err: ' + err + ' trace: ' + err.stack);
      deferred.reject(err);
    });
    return deferred.promise;
  };
}

function createSendMsgToFunction(msg) {
  return function(chatId, text) {
    let deferred = when.defer();
    global.bot.sendMessage(chatId, text)
    .then(function () {
      console.log('sent ' + text + ' to chat ' + chatId);
      deferred.resolve();
    }, function(err) {
      console.error('couldn\'t send chat msg! Err: ' + err);
      deferred.reject(err);
    });
    return deferred.promise;
  };
}

function createUserToStringFunction(msg) {
  return function(){
    return 'user: {id: '+msg.from.id+', name: '+msg.from.first_name + ' ' + msg.from.last_name + ', username: ' + msg.from.username + '}';
  };
}

utils.attachMethods = function attachMethods(msg) {
  msg.sendPrivateMsg = createSendPrivateMsgFunction(msg);
  msg.sendChatMsg = createSendChatMsgFunction(msg);
  msg.sendMsgTo = createSendMsgToFunction(msg);
  msg.userToString = createUserToStringFunction(msg);
};

utils.isValidInt = function(num){
  return !!parseInt(num, 10);
};

utils.isValidFloat = function(num){
  return !!parseFloat(num);
};

module.exports = utils;
