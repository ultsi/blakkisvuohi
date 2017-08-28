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

function initContext(userId, cmd, msg) {
  let context = new contexts.Context(cmd, msg);
  userContexts[userId] = context;
  return context;
}

function retrieveContext(userId, msg) {
  let earlierContext = userContexts[userId];
  if(earlierContext){
    earlierContext.msg = msg; // Update msg object to current one
    return earlierContext;
  }
  return false;
}

function callCommandFunction(context, cmd, msg, words) {
  if(context.phase === -1){
    // Context has been ended, do nothing.
    return;
  }

  const phaseFunc = cmd.funcs[context.phase];

  if(cmd.userCommand) {
    return users.find(msg.from.id)
      .then(function(user){
        phaseFunc(context, user, msg, words)
          .then(function(res){
            console.log('Phase ' + context.phase + ' of cmd ' + cmd.name + ' executed perfectly.');
          }, function(err){
            console.error('Couldn\'t execute cmd "'+cmd.name+'" phase ' + context.phase +'! ' + err + ' trace: ' + err.stack);
            msg.sendPrivateMsg('Virhe: ' + err + ' Komennon käyttö: ' + cmd.help);
          });
      }, function(err){
        console.error('Couldn\'t execute cmd "'+cmd.name+'" phase ' + context.phase +'! '+ err + ' trace: ' + err.stack);
        msg.sendPrivateMsg('Virhe: Komennon käyttö: ' + cmd.help);
      });
  } else {
    return phaseFunc(context, msg, words)
      .then(function(res){
        console.log('Phase ' + context.phase + ' of cmd ' + cmd.name + ' executed perfectly.');
      }, function(err){
        console.error('Couldn\'t execute cmd "'+cmd.name+'" phase ' + context.phase +'! ' + err + ' trace: ' + err.stack);
        msg.sendPrivateMsg('Virhe: ' + err + ' Komennon käyttö: ' + cmd.help);
      });
  }
}

function printHelp(msg) {
  let cmdstr = 'Komennot:\n';
  for(var i in cmds){
    cmdstr += cmds[i].help + '\n';
  }
  return msg.sendPrivateMsg(cmdstr);
}

Commands.call = function call(firstWord, msg, words) {
  utils.attachMethods(msg);
  const userId = msg.from.id;

  // Print command list
  if(firstWord === '/komennot' || firstWord === '/start' || firstWord === '/help') {
    return printHelp(msg);
  }

  if(cmds[firstWord]){
    const cmd = cmds[firstWord];

    // init context for command. Command context is always reinitialised
    // when calling just the command
    const context = initContext(userId, cmd, msg);

    try {
      if(cmd.type === Commands.TYPE_PRIVATE && !context.isPrivateChat()){
        return context.privateReply('Käytä komentoa vain minun kanssa!');
      }

      callCommandFunction(context, cmd, msg, words);
    } catch (err) {
      console.log('Couldn\'t execute cmd "'+cmd.name+'"! '+ err + ' trace: ' + err.stack);
      return msg.sendChatMsg('Virhe! Komennon käyttö: ' + cmd.help);
    }
  } else {
    const context = retrieveContext(userId, msg);
    if(!context){
      return msg.sendChatMsg('Aloita käyttö kirjoittamalla /help');
    }

    const cmd = context.cmd;
    try {
      if(!context.isPrivateChat()){
        // don't spam chats if not a command this bot recognizes
        return;
      }
      return callCommandFunction(context, cmd, msg, words);
    } catch (err) {
      console.log('Couldn\'t execute cmd "' + cmd.name + '"! ' + err + ' trace: ' + err.stack);
      return msg.sendChatMsg('Virhe! Komennon käyttö: ' + cmd.help);
    }
  }
};

module.exports = Commands;
