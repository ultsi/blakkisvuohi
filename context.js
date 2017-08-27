'use strict';

let when = require('when');
let contexts = {};

/*
  Context.js
  this file contains the functions for the context object used with commands
*/

contexts.Context = function(msg, variables){
  this.msg = msg;
  this.variables = variables ? variables : {};
};

contexts.Context.prototype.privateReply = function(text) {
  let deferred = when.defer();
  global.bot.sendMessage(this.msg.from.id, text)
  .then(function () {
    console.log('Sent ' + text + ' to ' + this.msg.from.username);
    deferred.resolve();
  }, function(err) {
    console.error('couldn\'t send private msg! Err: ' + err);
    deferred.reject(err);
  });
  return deferred.promise;
};

contexts.Context.prototype.chatReply = function(text) {
  let deferred = when.defer();
  global.bot.sendMessage(this.msg.chat.id, text)
  .then(function () {
    console.log('Sent ' + text + ' to chat ' + this.msg.chat.title);
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
