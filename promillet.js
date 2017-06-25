'use strict';

const cmd = require('./cmd.js');
const utils = require('./utils.js');
const users = require('./users.js');

const TOLKKI = 0.047*33;
const PINTTI = 0.047*50;

cmd.register('/luotunnus', cmd.TYPE_PRIVATE, function(msg, words){
  users.new(msg.from.id, msg.from.username, words[1], words[2])
  .then(function(user){
    utils.sendPrivateMsg(msg, 'Moikka ' + user.nick);
  }, function(err){
    utils.sendPrivateMsg(msg, err);
  });
}, '/luotunnus <paino> <mies/nainen>');

cmd.register('/whoami', cmd.TYPE_PRIVATE, function(msg, words){
  users.find(msg.from.id)
  .then(function(user){
    utils.sendPrivateMsg(msg, 'Käyttäjä ' + user.nick + ', id: ' + user.userId + ', paino: ' + user.weight + ', sukupuoli: ' + user.gender);
  }, function(err){
    utils.sendPrivateMsg(msg, err);
  });
}, '/whoami - tulosta omat tietosi.');

cmd.register('/tolkki', cmd.TYPE_PRIVATE, function(msg, words){
  users.find(msg.user.id)
  .then(function(user){
    user.drinkBooze(TOLKKI)
    .then(function(){
      utils.sendPrivateMsg(msg, 'toimii');
    }, function(err){
      utils.sendPrivateMsg(msg, err);
    });
  }, function(err){
    utils.sendPrivateMsg(msg, err);
  });
}, '/tolkki - juo yksi 0.33l');

cmd.register('/pintti', cmd.TYPE_PRIVATE, function(msg, words){
  users.find(msg.user.id)
  .then(function(user){
    users.drinkBooze(user, PINTTI)
    .then(function(){
      utils.sendPrivateMsg(msg, 'toimii');
    }, function(err){
      utils.sendPrivateMsg(msg, err);
    });
  }, function(err){
    utils.sendPrivateMsg(msg, err);
  });
}, '/pintti - juo yksi 0.5l');
