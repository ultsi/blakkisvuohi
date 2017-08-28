/*
  Context.js
  this file contains the functions for the context object used with commands
*/

'use strict';

let when = require('when');
let contexts = {};

contexts.Context = function(cmd, msg){
  this.cmd = cmd;
  this.msg = msg;
  this.phase = 0;
  this.variables = {};
};

contexts.Context.prototype.privateReply = function(text) {
  let deferred = when.defer();
  let self = this;
  let options = {
    "parse_mode": "Markdown",
    "reply_to_message_id": this.msg.message_id,
    "reply_markup": {
      "remove_keyboard": true
    }
  };
  global.bot.sendMessage(self.msg.from.id, text, options)
  .then(function () {
    console.log('Sent ' + text + ' to ' + self.msg.from.username);
    deferred.resolve();
  }, function(err) {
    console.error('couldn\'t send private msg! Err: ' + err + ' trace: ' + err.stack);
    deferred.reject(err);
  });
  return deferred.promise;
};

contexts.Context.prototype.privateReplyWithKeyboard = function(text, keyboardButtons) {
  let deferred = when.defer();
  let self = this;
  let options = {
    "parse_mode": "Markdown",
    "reply_markup": {
      "keyboard": keyboardButtons,
      "resize_keyboard": true,
      "one_time_keyboard": true
    },
    "reply_to_message_id": this.msg.message_id
  };
  global.bot.sendMessage(self.msg.from.id, text, options)
  .then(function () {
    console.log('Sent ' + text + ' to ' + self.msg.from.username);
    deferred.resolve();
  }, function(err) {
    console.error('couldn\'t send private msg! Err: ' + err);
    deferred.reject(err);
  });
  return deferred.promise;
};

contexts.Context.prototype.chatReply = function(text) {
  let deferred = when.defer();
  let self = this;
  global.bot.sendMessage(self.msg.chat.id, text)
  .then(function () {
    console.log('Sent ' + text + ' to chat ' + self.msg.chat.title);
    deferred.resolve();
  }, function(err) {
    console.error('couldn\'t send chat msg! Err: ' + err);
    deferred.reject(err);
  });
  return deferred.promise;
};

contexts.Context.prototype.storeVariable = function(key, value) {
  this.variables[key] = value;
};

contexts.Context.prototype.fetchVariable = function(key) {
  return this.variables[key];
};

contexts.Context.prototype.forgetVariables = function() {
  return this.variables = {};
};

contexts.Context.prototype.nextPhase = function() {
  this.phase += 1;
};

contexts.Context.prototype.toPhase = function(phase) {
  this.phase = phase;
}

contexts.Context.prototype.previousPhase = function() {
  this.phase -= 1;
};

contexts.Context.prototype.end = function() {
  this.phase = -1;
  this.variables = 0;
};

contexts.Context.prototype.isPrivateChat = function() {
  return this.msg.chat.type === 'private';
};

module.exports = contexts;
