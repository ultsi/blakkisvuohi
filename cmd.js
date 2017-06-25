'use strict';

const utils = require('./utils.js');

let cmd = {};

let cmds = {};
cmd.TYPE_PRIVATE = 'private';
cmd.TYPE_ALL = 'all';

cmd.register = function register(cmd, type, func, help) {
  cmds[cmd] = {
    type: type === cmd.TYPE_PRIVATE ? cmd.TYPE_PRIVATE : cmd.TYPE_ALL,
    func: func,
    help: help
  };
};

cmd.call = function call(cmd, msg, words) {
  if(cmds[cmd]){
    try {
      if(cmd.type === cmd.TYPE_PRIVATE && msg.chat.type !== 'private'){
        utils.sendPrivateMsg(msg, 'Käytä komentoa vain minun kanssa! Komennon käyttö: ' + cmds[cmd].help);
        return;
      }
      cmds[cmd].func(msg, words);
    } catch (err) {
      console.log('Couldn\'t execute cmd "'+cmd+'"! ' + err);
      utils.sendMsg(msg, 'Virhe! Komennon käyttö: ' + cmds[cmd].help);
    }
  }
};

module.exports = cmd;
