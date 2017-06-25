'use strict';

const cmd = require('./cmd.js');
const utils = require('./utils.js');
const users = require('./users.js');

cmd.register('/luotunnus', cmd.TYPE_PRIVATE, function(msg, words){
  users.new(msg.from.id, msg.from.username, words[1], words[2])
  .then(function(user){
    utils.sendPrivateMsg(msg, 'Moikka ' + user.nick);
  }, function(err){
    utils.sendPrivateMsg(msg, err);
  });
}, '/luotunnus <paino> <mies/nainen>');

cmd.register('/whoami', cmd.TYPE_PRIVATE, function(msg, words){
  users.find(msg.user.id)
  .then(function(user){
    utils.sendPrivateMsg(msg, 'Käyttäjä ' + user.nick + ', id: ' + user.userId + ', paino: ' + user.weight + ', sukupuoli: ' + user.gender);
  }, function(err){
    utils.sendPrivateMsg(msg, err);
  });
}, '/whoami - tulosta omat tietosi.');

cmd.register('/kalja', cmd.TYPE_PRIVATE, function(msg, words){
  users.find(msg.user.id)
  .then(function(user){
    utils.sendPrivateMsg(msg, 'Käyttäjä ' + user.nick + ', id: ' + user.userId + ', paino: ' + user.weight + ', sukupuoli: ' + user.gender);
  }, function(err){
    utils.sendPrivateMsg(msg, err);
  });
}, '/kalja - juo yksi kalja talteen');
