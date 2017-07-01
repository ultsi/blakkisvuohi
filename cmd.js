'use strict';

const utils = require('./utils.js');

let cmd = {};

let cmds = {};
cmd.TYPE_PRIVATE = 'private';
cmd.TYPE_ALL = 'all';

cmd.register = function register(cmd, type, func, help) {
  console.log('Added command ' + cmd + ' : (' + type + ')');
  cmds[cmd] = {
    type: type,
    func: func,
    help: help
  };
};

cmd.call = function call(cmd, msg, words) {
  utils.attachMethods(msg);
  if(cmds[cmd]){
    try {
      console.log(cmds[cmd]);
      if(cmds[cmd].type === 'private' && msg.chat.type !== 'private'){
        msg.sendPrivateMsg('Käytä komentoa vain minun kanssa! Komennon käyttö: ' + cmds[cmd].help);
        return;
      }
      cmds[cmd].func(msg, words);
    } catch (err) {
      console.log('Couldn\'t execute cmd "'+cmd+'"! ' + err);
      msg.sendMsg('Virhe! Komennon käyttö: ' + cmds[cmd].help);
    }
  } else if (cmd === '/komennot'|| cmd === '/start' || cmd === '/help') {
    let cmdstr = 'Komennot:\n';
    for(var i in cmds){
      cmdstr += cmds[i].help + '\n';
    }
    msg.sendPrivateMsg(cmdstr);
  }
};

module.exports = cmd;
