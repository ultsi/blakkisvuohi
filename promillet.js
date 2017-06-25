'use strict';

const cmd = require('./cmd.js');
const utils = require('./utils.js');

cmd.register('/luotunnus', cmd.TYPE_PRIVATE, function(msg, words){
  utils.sendPrivateMsg('luotu!');
}, 'Komennon käyttö: /luotunnus <paino> <mies/nainen>');
