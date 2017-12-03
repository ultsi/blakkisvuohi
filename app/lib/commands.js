/*
    Bläkkisvuohi, a Telegram bot to help track estimated blood alcohol concentration.
    Copyright (C) 2017  Joonas Ulmanen

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

/*
    commands.js
    Simple command library to register different commands and call them via callbacks.
    Dependent on the context and the user framework that Bläkkisvuohi uses.
*/

'use strict';

const users = require('../db/users.js');
const contexts = require('./context.js');
const settings = require('../settings.js');
const strings = require('../strings.js');
const log = require('loglevel').getLogger('system');


let Commands = module.exports = {};
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
    log.info('Added command ' + cmdName + ' : (' + cmdType + ') with ' + cmdFunctions.length + ' phases.');
};

Commands.registerUserCommand = function(cmdName, cmdHelp, cmdType, cmdFunctions) {
    cmds[cmdName] = {
        name: cmdName,
        type: cmdType,
        funcs: cmdFunctions,
        help: cmdHelp,
        userCommand: true
    };
    log.info('Added usercommand ' + cmdName + ' : (' + cmdType + ') with ' + cmdFunctions.length + ' phases.');
};

Commands.registerUserCommandV2 = function(cmdName, cmdHelp, cmdType, cmdFunctions) {
    cmds[cmdName] = {
        name: cmdName,
        type: cmdType,
        funcs: cmdFunctions,
        help: cmdHelp,
        userCommand: true,
        version: 2
    };
    log.info('Added usercommand ' + cmdName + ' : (' + cmdType + ') with ' + cmdFunctions.length + ' phases.');
};

Commands.registerAdminCommand = function(cmdName, cmdHelp, cmdType, cmdFunctions) {
    cmds[cmdName] = {
        name: cmdName,
        type: cmdType,
        funcs: cmdFunctions,
        help: cmdHelp,
        userCommand: true,
        adminCommand: true
    };
    log.info('Added admincommand ' + cmdName + ' : (' + cmdType + ') with ' + cmdFunctions.length + ' phases.');
};

function initContext(userId, cmd, msg) {
    let context = new contexts.Context(cmd, msg);
    userContexts[userId] = context;
    return context;
}

function retrieveContext(userId, msg) {
    let earlierContext = userContexts[userId];
    if (earlierContext) {
        earlierContext.msg = msg; // Update msg object to current one
        return earlierContext;
    }
    return false;
}

function callCommandFunction(context, cmd, msg, words) {
    if (context.phase === -1) {
        // Context has been ended, do nothing.
        return;
    }

    const phaseFunc = cmd.funcs[context.phase];

    if (cmd.userCommand) {
        return users.find(msg.from.id)
            .then((user) => {
                try {
                    log.debug('Executing phase ' + context.phase + ' of usercmd ' + cmd.name);
                    log.debug('Words: ' + words);
                    log.debug('User: ' + user.username + ' id: ' + user.userId);

                    if (cmd.adminCommand && user.userId !== settings.admin_id) {
                        log.info('User ' + user.username + ' tried to use admin command');
                        msg.sendPrivateMessage('Unauthorized.');
                    } else if (cmd.version === 2) {

                        /* Version 2 definition of commands */
                        const phase = phaseFunc;

                        if (context.phase === 0 && !context.fetchVariable('_started')) {
                            context.sendMessage(phase.startMessage);
                            context.storeVariable('_started', true);
                        } else if (phase.validateInput(context, user, msg, words)) {
                            try {
                                phase.onValidInput(context, user, msg, words);
                                if (phase.nextPhase) {
                                    context.toPhase(phase.nextPhase);
                                    let newPhase = cmd.funcs[context.phase];
                                    context.sendMessage(newPhase.startReply);
                                } else {
                                    context.end();
                                }
                            } catch (err) {
                                log.error('Error executing v2 user cmd function "' + cmd.name + '" phase ' + context.phase + '! ' + err);
                                log.debug(err.stack);
                                msg.sendPrivateMessage('Virhe! Ota yhteyttä @ultsi');
                            }
                        } else {
                            context.sendMessage(phase.errorMessage);
                        }

                    } else {
                        phaseFunc(context, user, msg, words)
                            .then((res) => {
                                log.debug('Phase ' + context.phase + ' of cmd ' + cmd.name + ' executed perfectly.');
                            }, (err) => {
                                log.error('Error executing user cmd function "' + cmd.name + '" phase ' + context.phase + '! ' + err);
                                log.debug(err.stack);
                                msg.sendPrivateMessage('Virhe: Komennon käyttö: ' + cmd.help);
                            });
                    }
                } catch (err) {
                    log.error('Couldn\'t execute user cmd function "' + cmd.name + '" phase ' + context.phase + '! ' + err);
                    log.debug(err.stack);
                    msg.sendPrivateMessage('Virhe: Komennon käyttö: ' + cmd.help);
                }
            }, (err) => {
                log.error('Couldn\'t find user for cmd "' + cmd.name + '" phase ' + context.phase + '! ' + err);
                log.debug(err.stack);
                msg.sendPrivateMessage('Virhe: Komennon käyttö: ' + cmd.help);
            });
    } else {
        return phaseFunc(context, msg, words)
            .then((res) => {
                log.debug('Executing phase ' + context.phase + ' of cmd ' + cmd.name);
                log.debug('Words: ' + words);
                log.debug('Phase ' + context.phase + ' of cmd ' + cmd.name + ' executed perfectly.');
            }, (err) => {
                log.error('Couldn\'t execute cmd function "' + cmd.name + '" phase ' + context.phase + '! ' + err);
                log.debug(err.stack);
                msg.sendPrivateMessage('Virhe: Komennon käyttö: ' + cmd.help);
            });
    }
}

function listCmdHelp() {
    let cmdHelpList = [];
    for (var i in cmds) {
        if (!cmds[i].adminCommand) {
            cmdHelpList.push(cmds[i].help);
        }
    }
    return cmdHelpList;
}

Commands.call = function call(firstWord, msg, words) {
    const userId = msg.from.id;

    // Print start message
    if (firstWord === '/start') {
        return msg.sendPrivateMessage(strings.help_text);
    } else if (firstWord === '/komennot') {
        const cmdListStr = listCmdHelp().join('\n');
        return msg.sendPrivateMessage('Komennot:\n\n' + cmdListStr);
    } else if (firstWord === '/help') {
        const cmdListStr = listCmdHelp().join('\n');
        return msg.sendPrivateMessage(strings.help_text + '\n\nKomennot:\n\n' + cmdListStr);
    }

    if (cmds[firstWord]) {
        const cmd = cmds[firstWord];

        // init context for command. Command context is always reinitialised
        // when calling just the command
        const context = initContext(userId, cmd, msg);

        try {
            if (cmd.type === Commands.TYPE_PRIVATE && !context.isPrivateChat()) {
                return context.privateReply('Käytä komentoa vain minun kanssa!');
            }

            callCommandFunction(context, cmd, msg, words);
        } catch (err) {
            log.error('Couldn\'t execute cmd function "' + cmd.name + '" phase ' + context.phase + '! ' + err);
            log.debug(err.stack);
            return msg.sendChatMessage('Virhe! Komennon käyttö: ' + cmd.help);
        }
    } else {
        const context = retrieveContext(userId, msg);
        if (!context) {
            return msg.sendChatMessage('Aloita käyttö kirjoittamalla /help');
        }

        const cmd = context.cmd;
        try {
            if (!context.isPrivateChat()) {
                // don't spam chats if not a command this bot recognizes
                return;
            }
            return callCommandFunction(context, cmd, msg, words);
        } catch (err) {
            log.error('Couldn\'t execute cmd function "' + cmd.name + '" phase ' + context.phase + '! ' + err);
            log.debug(err.stack);
            return msg.sendChatMessage('Virhe! Komennon käyttö: ' + cmd.help);
        }
    }
};