'use strict';

const utils = require('./utils.js');
const when = require('when');
const users = require('./users.js');
const contexts = require('./context.js');

let Commands = {};
let cmds = {};
let userContexts = {};

Commands.TYPE_PRIVATE = 'private';
Commands.TYPE_ALL = 'all';

Commands.register = function(cmdName, cmdHelp, cmdType, cmdFunctions) {
  cmds[cmdName] = {
    name: cmdName,
    type: cmdType,
    funcs: cmdFunctions,
    help: cmdHelp,
    userCommand: false
  };
  console.log('Added command ' + cmdName + ' : (' + cmdType + ') with ' + cmdFunctions.length + ' phases.');
};

Commands.registerUserCommand = function(cmdName, cmdHelp, cmdType, cmdFunctions) {
  cmds[cmdName] = {
    name: cmdName,
    type: cmdType,
    funcs: cmdFunctions,
    help: cmdHelp,
    userCommand: true
  };
  console.log('Added command ' + cmdName + ' : (' + cmdType + ') with ' + cmdFunctions.length + ' phases.');
};

function getContext(userId, cmd, msg) {
  let earlierContext = userContexts[userId];
  if(earlierContext && earlierContext.cmd.name === cmd.name){
    earlierContext.msg = msg; // Update msg object to current one
    return earlierContext;
  } else {
    let context = new contexts.Context(msg, cmd);
    userContexts[userId] = context;
    return context;
  }
}

Commands.call = function call(cmdName, msg, words) {
  utils.attachMethods(msg);
  if(cmds[cmdName]){
    const cmd = cmds[cmdName];

    // get context for command
    const context = getContext(msg.from.id, cmd, msg);

    try {
      console.log(cmd);
      if(cmd.type === Commands.TYPE_PRIVATE && !context.isPrivateChat()){
        return context.privateReply('Käytä komentoa vain minun kanssa!');
      }

      const phaseFunc = cmd.funcs[context.phase];

      phaseFunc(context, msg, words)
        .then(function(res){
          console.log('Phase ' + context.phase + ' of cmd ' + cmdName + ' executed perfectly.');
        }, function(err){
          console.error('Couldn\'t execute cmd "'+cmdName+'" phase ' + context.phase +'! ' + err);
          return msg.sendPrivateMsg('Virhe: ' + err + ' Komennon käyttö: ' + cmd.help);
        });
    } catch (err) {
      console.log('Couldn\'t execute cmd "'+cmdName+'"! ' + err);
      return msg.sendChatMsg('Virhe! Komennon käyttö: ' + cmd.help);
    }
  } else if (cmdName === '/komennot'|| cmdName === '/start' || cmdName === '/help') {
    let cmdstr = 'Komennot:\n';
    for(var i in cmds){
      cmdstr += cmds[i].help + '\n';
    }
    return msg.sendPrivateMsg(cmdstr);
  }
};

module.exports = Commands;
