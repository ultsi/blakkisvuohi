'use strict';

let cmd = {};

let cmds = {};

cmd.register = function register(cmd, func) {
  cmds[cmd] = func;
};

cmd.call = function call(cmd, msg, words) {
  if(cmds[cmd]){
    try {
      cmds[cmd](msg, words);
    } catch (err) {
      console.log('Couldn\'t execute cmd "'+cmd+'"! ' + err);
    }
  }
};
