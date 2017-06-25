'use strict';

let utils = {};

utils.isValidNumber = function(num){
  return parseInt(num, 10) !== 'NaN';
};

utils.sendPrivateMsg = function(msg, text) {
  GLOBAL.bot.sendMessage(msg.from.id, text)
  .then(function () {
    console.log('sent ' + text + ' to ' + msg.from.username);
  }, function(err) {
    console.error('couldn\'t send confirmation of updated text! Err: ' + err);
  });
};

utils.sendMsg = function(msg, text) {
  GLOBAL.bot.sendMessage(msg.chat.id, text)
  .then(function () {
    console.log('sent ' + text + ' to ' + msg.from.username);
  }, function(err) {
    console.error('couldn\'t send confirmation of updated text! Err: ' + err);
  });
};

module.exports = utils;
