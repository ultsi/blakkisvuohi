'use strict';

const utils = require('./utils.js');
const when = require('when');
const users = require('./users.js');

let cmd = {};

let cmds = {};

cmd.chatResponse = function(text){return ['chat', text];};
cmd.privateResponse = function(text){return ['private', text];};

cmd.TYPE_PRIVATE = 'private';
cmd.TYPE_ALL = 'all';

cmd.register = function register(cmdName, cmdType, cmdFunc, cmdHelp) {
  cmds[cmdName] = {
    type: cmdType,
    func: cmdFunc,
    help: cmdHelp
  };
  console.log('Added command ' + cmdName + ' : (' + cmdType + ')');
};

cmd.registerUserCmd = function register(cmdName, cmdType, cmdFunc, cmdHelp) {
  let func = function(msg, words){
    let deferred = when.defer();
    console.log('Running user cmd ' + cmdName);
    users.find(msg.from.id)
      .then(function(user){
        if(!user){
          console.log('Didn\'t find user ' + msg.userToString());
          deferred.resolve(cmd.chatResponse('Moi! Juttele minulle ensiksi privassa ja luo tunnus käyttämällä komentoa /luotunnus'));
          return deferred.promise;
        }
        console.log('Found user: ' + user.nick);
        cmdFunc(msg, words, user)
          .then(function(res){
            deferred.resolve(res);
          }, function(err){
            console.log(err);
            deferred.reject(err);
          });
      }, function(err){
        console.log(err);
        deferred.reject(err);
      });
    return deferred.promise;
  };
  cmds[cmdName] = {
    type: cmdType,
    func: func,
    help: cmdHelp,
    state: {}
  };
  console.log('Added user command ' + cmdName + ' : (' + cmdType + ')');
};

cmd.call = function call(cmdName, msg, words) {
  utils.attachMethods(msg);
  if(cmds[cmdName]){
    try {
      console.log(cmds[cmdName]);
      if(cmds[cmdName].type === cmd.TYPE_PRIVATE && msg.chat.type !== 'private'){
        return msg.sendPrivateMsg('Käytä komentoa vain minun kanssa! Komennon käyttö: ' + cmds[cmdName].help);
      }
      cmds[cmdName].func(msg, words)
        .then(function(res){
          if(res[0] === 'chat'){
            msg.sendChatMsg(res[1]);
          } else {
            msg.sendPrivateMsg(res[1]);
          }
        }, function(err){
          console.error('Couldn\'t execute cmd "'+cmdName+'"! ' + err);
          return msg.sendPrivateMsg('Virhe: ' + err + ' Komennon käyttö: ' + cmds[cmdName].help);
        });
    } catch (err) {
      console.log('Couldn\'t execute cmd "'+cmdName+'"! ' + err);
      return msg.sendChatMsg('Virhe! Komennon käyttö: ' + cmds[cmdName].help);
    }
  } else if (cmdName === '/komennot'|| cmdName === '/start' || cmdName === '/help') {
    let cmdstr = 'Komennot:\n';
    for(var i in cmds){
      cmdstr += cmds[i].help + '\n';
    }
    return msg.sendPrivateMsg(cmdstr);
  }
};

module.exports = cmd;
