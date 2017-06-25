'use strict';

const cmd = require('./cmd.js');
const utils = require('./utils.js');
const users = require('./users.js');

cmd.register('/luotunnus', cmd.TYPE_PRIVATE, function(msg, words){
  console.log(words);
  users.new(msg.from.id, msg.from.username, words[1], words[2])
  .then(function(user){
    utils.sendPrivateMsg(msg, 'Moikka ' + user.nick);
  }, function(err){
    utils.sendPrivateMsg(msg, err);
  });
}, '/luotunnus <paino> <mies/nainen>');
