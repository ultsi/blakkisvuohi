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
const utils = require('./utils.js');
const log = require('loglevel').getLogger('system');
const announcements = require('../announcements.js');

let Commands = module.exports = {};
let cmds = {};
let userContexts = {};

Commands.TYPE_PRIVATE = 'private';
Commands.TYPE_ALL = 'all';

Commands.__cmds__ = cmds;

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

Commands.registerSimple = function(cmdName, cmdHelp, cmdType, cmdFunction) {
    cmds[cmdName] = {
        name: cmdName,
        type: cmdType,
        func: cmdFunction,
        help: cmdHelp,
        userCommand: false,
        simple: true
    };
    log.info('Added simple command ' + cmdName + ' : (' + cmdType + ')');
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

function callUserCommand(context, cmd, msg, words, user) {
    if (!user.read_terms) {
        msg.sendPrivateMessage(strings.commands.blakkis.please_update_user_info);
        return Promise.resolve(); // reject or resolve?
    }
    if (user.read_announcements < announcements.length) {
        const unread_announcements = announcements.slice(user.read_announcements, announcements.length + 1);
        msg.sendPrivateMessage(strings.commands.blakkis.announcements.format({
            announcements: unread_announcements.join('\n\n')
        }));
        user.updateReadAnnouncements(announcements.length);
    }
    try {
        log.debug('Executing phase ' + context.phase + ' of usercmd ' + cmd.name);
        log.debug('Words: ' + words);
        log.debug('User: ' + user.username + ' id: ' + user.userId);

        if (cmd.adminCommand && user.userId !== settings.admin_id) {
            log.info('User ' + user.username + ' tried to use admin command');
            msg.sendPrivateMessage(strings.commands.blakkis.unauthorized);
            return Promise.resolve(); // reject or resolve?
        } else if (cmd.version === 2) {

            /* Version 2 definition of commands */
            let phase = cmd.funcs[context.phase];
            if (context.phase === 0 && !context.fetchVariable('_started')) {
                context.sendMessage(phase.startMessage);
                context.storeVariable('_started', true);
                return Promise.resolve(); // reject or resolve?
            } else if (phase.validateInput(context, user, msg, words)) {
                try {
                    return phase.onValidInput(context, user, msg, words)
                        .then(() => {
                            phase = cmd.funcs[context.phase];
                            if (phase.nextPhase || phase.nextPhase === 0) {
                                context.toPhase(phase.nextPhase);
                                let newPhase = cmd.funcs[context.phase];
                                context.sendMessage(newPhase.startMessage);
                            } else {
                                context.end();
                            }
                            log.debug('Executing phase ' + context.phase + ' of usercmd ' + cmd.name);
                            log.debug('Words: ' + words);
                            log.debug('Phase ' + context.phase + ' of cmd ' + cmd.name + ' executed perfectly.');
                            return Promise.resolve(); // reject or resolve?
                        });
                } catch (err) {
                    log.error('Error executing v2 user cmd function "' + cmd.name + '" phase ' + context.phase + '! ' + err);
                    log.debug(err.stack);
                    msg.sendPrivateMessage(strings.commands.blakkis.error);
                    return Promise.reject(err);
                }
            } else {
                context.sendMessage(phase.errorMessage);
                return Promise.resolve(); // reject or resolve?
            }

        } else {
            let func = cmd.funcs[context.phase];
            return func(context, user, msg, words)
                .then((res) => {
                    log.debug('Phase ' + context.phase + ' of cmd ' + cmd.name + ' executed perfectly.');
                    return Promise.resolve();
                }).catch((err) => {
                    log.error('Error executing user cmd function "' + cmd.name + '" phase ' + context.phase + '! ' + err);
                    log.debug(err.stack);
                    msg.sendPrivateMessage(strings.commands.blakkis.command_error.format({
                        cmd_help: cmd.help
                    }));
                    return Promise.reject(err);
                });
        }
    } catch (err) {
        log.error('Couldn\'t execute user cmd function "' + cmd.name + '" phase ' + context.phase + '! ' + err);
        log.debug(err.stack);
        msg.sendPrivateMessage(strings.commands.blakkis.command_error.format({
            cmd_help: cmd.help
        }));
        return Promise.reject(err);
    }
}

function callCommandFunction(context, cmd, msg, words) {
    if (cmd.simple) {
        return cmd.func(context, msg, words);
    }

    const phaseFunc = cmd.funcs[context.phase];

    if (cmd.userCommand) {
        return users.find(msg.from.id)
            .then((user) => {
                if (user) {
                    return callUserCommand(context, cmd, msg, words, user);
                } else {
                    return Promise.reject(new Error('couldn\'t find user for command ' + cmd.name + ' phase ' + context.phase));
                }
            })
            .catch((err) => {
                log.error(err);
                log.debug(err.stack);
                msg.sendPrivateMessage(strings.commands.blakkis.command_error.format({
                    cmd_help: cmd.help
                }));
            });
    } else {
        /* Version 2 definition of commands */
        let phase = phaseFunc;
        if (context.phase === 0 && !context.fetchVariable('_started')) {
            context.sendMessage(phase.startMessage);
            context.storeVariable('_started', true);
            return Promise.resolve();
        } else if (phase.validateInput(context, msg, words)) {
            try {
                return phase.onValidInput(context, msg, words)
                    .then(() => {
                        phase = cmd.funcs[context.phase];
                        if (phase.nextPhase || phase.nextPhase === 0) {
                            context.toPhase(phase.nextPhase);
                            let newPhase = cmd.funcs[context.phase];
                            context.sendMessage(newPhase.startMessage);
                        } else {
                            context.end();
                        }
                        log.debug('Executing phase ' + context.phase + ' of cmd ' + cmd.name);
                        log.debug('Words: ' + words);
                        log.debug('Phase ' + context.phase + ' of cmd ' + cmd.name + ' executed perfectly.');
                        return Promise.resolve();
                    }).catch((err) => {
                        log.error('Couldn\'t execute cmd function "' + cmd.name + '" phase ' + context.phase + '! ' + err);
                        msg.sendPrivateMessage(strings.commands.blakkis.error);
                        return Promise.reject(err);
                    });
            } catch (err) {
                log.error('Error executing v2 cmd function "' + cmd.name + '" phase ' + context.phase + '! ' + err);
                log.debug(err.stack);
                msg.sendPrivateMessage(strings.commands.blakkis.error);
                return Promise.reject(err);
            }
        } else {
            context.sendMessage(phase.errorMessage);
            return Promise.resolve();
        }
    }
}

Commands.call = function call(firstWord, msg, words) {
    const userId = msg.from.id;

    let cmd, context;
    if (cmds[firstWord]) {
        cmd = cmds[firstWord];
        if (msg.chat.type === 'private') {
            context = initContext(userId, cmd, msg); // reinitiate user's contexts in private
        } else {
            context = new contexts.Context(cmd, msg); // otherwise use a dummy context to not lose private context
        }
    } else {
        // first word was not a command, try to find a command by context
        context = retrieveContext(userId, msg);

        if (!context) {
            return msg.sendChatMessage(strings.commands.blakkis.command_not_found);
        }

        if (!context.isPrivateChat()) {
            // cmds with context only allowed in private
        }
        cmd = context.cmd;
    }

    if (cmd.type === Commands.TYPE_PRIVATE && !context.isPrivateChat()) {
        return msg.sendPrivateMessage(strings.commands.blakkis.use_only_in_private);
    }

    if (context.phase === -1) {
        return Promise.resolve();
    }

    return utils.hookNewRelic('command/' + firstWord, function() {

        try {
            log.info((msg.from.username || msg.from.first_name) + ': ' + firstWord);
            return callCommandFunction(context, cmd, msg, words);
        } catch (err) {
            log.error('Couldn\'t execute cmd function "' + cmd.name + '" phase ' + context.phase + '! ' + err);
            log.debug(err.stack);
            msg.sendPrivateMessage(strings.commands.blakkis.command_error.format({
                cmd_help: cmd.help
            }));
            return Promise.reject(err);
        }
    }).catch((err) => {
        log.error('Couldn\'t execute cmd ' + cmd.name);
        log.debug(err);
    });
};