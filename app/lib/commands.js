/*a
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
const strings = require('../strings.js');
const utils = require('./utils.js');
const log = require('loglevel').getLogger('system');
const announcements = require('../announcements.js');
const settings = require('../settings.js');
const errors = require('./errors.js');
const InlineKeyboardCommand = require('./inline-keyboard-command.js');

let Commands = module.exports = {};
let cmds = {};
let userContexts = {};

Commands.SCOPE_PRIVATE = 'private';
Commands.SCOPE_CHAT = 'chat';
Commands.SCOPE_ALL = 'all';

Commands.PRIVILEGE_USER = 'user';
Commands.PRIVILEGE_ADMIN = 'admin';
Commands.PRIVILEGE_ALL = 'all';

Commands.TYPE_SINGLE = 'single';
Commands.TYPE_MULTI = 'multi';
Commands.TYPE_INLINE = 'inline';

Commands.__cmds__ = cmds;

function registerInlineCommand(cmdName, cmdHelp, cmdScope, cmdPrivilege, cmdType, cmdDefinition) {
    let cmdClass = new InlineKeyboardCommand(cmdDefinition, cmdName);

    cmds[cmdName] = {
        name: cmdName,
        help: cmdHelp,
        scope: cmdScope,
        privilege: cmdPrivilege,
        type: cmdType,
        definition: cmdClass
    };
}

Commands.register = function(cmdName, cmdHelp, cmdScope, cmdPrivilege, cmdType, cmdDefinition) {
    if (cmdType === Commands.TYPE_INLINE) {
        registerInlineCommand(cmdName, cmdHelp, cmdScope, cmdPrivilege, cmdType, cmdDefinition);
    } else {
        cmds[cmdName] = {
            name: cmdName,
            help: cmdHelp,
            scope: cmdScope,
            privilege: cmdPrivilege,
            type: cmdType,
            definition: cmdDefinition
        };
    }
    const definitionText = typeof cmdDefinition;
    log.info(strings.commands.blakkis.on_cmd_register.format({
        name: cmdName,
        scope: cmdScope,
        privilege: cmdPrivilege,
        type: cmdType,
        definition: definitionText
    }));
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

function sendErrorMessage(msg, err) {
    switch (err.constructor) {
        case errors.PrivateCommandUsedInChat:
            return msg.sendPrivateMessage(strings.commands.blakkis.use_only_in_private);
        case errors.ChatCommandUsedInPrivate:
            return msg.sendPrivateMessage(strings.commands.blakkis.use_only_in_chats);
        case errors.ContextEnded:
            return msg.sendPrivateMessage(strings.commands.blakkis.command_not_found);
        case errors.UserNotAdmin:
            return msg.sendPrivateMessage(strings.commands.blakkis.unauthorized);
        case errors.UserNotFound:
            return msg.sendPrivateMessage(strings.commands.blakkis.user404);
        case errors.UserNotReadTerms:
            return msg.sendPrivateMessage(strings.commands.blakkis.please_update_user_info);
        default:
            log.error('!!!Unknown error!!!');
            log.error(err);
            log.error(msg);
            log.error('!!!Unknown error!!!');
            return msg.sendMessage(settings.admin_id, `Unknown error ${err.message} upon user ${msg.from.username} sending msg ${msg.text}`)
                .then(() => msg.sendPrivateMessage(strings.commands.blakkis.error))
                .catch((err) => {
                    log.error('CANT SEND ERROR MESSAGES');
                    log.error(err);
                });
    }
}

Commands.rawCall = function(msg) {
    if (!msg.text) {
        return Promise.resolve();
    }
    const words = msg.text.split(/\s/g);
    const bot_suffix = words[0].match(/@(.+)/);
    if (bot_suffix && bot_suffix[1] && bot_suffix[1].toLowerCase() !== settings.bot_username) {
        return Promise.resolve();
    }

    const cmd_only = words[0].replace(/@.+/, '').toLowerCase(); // remove trailing @username
    return Commands.call(cmd_only, msg, words, bot_suffix);
}

Commands.call = function call(firstWord, msg, words, bot_suffix) {
    const userId = msg.from.id;

    // Find out cmd and context first
    let cmd, context;
    if (msg.data) {
        const dataCmdName = msg.data.match(/\/\w+/);
        // inline keyboard stuff, retrieve context
        context = retrieveContext(userId, msg);

        if (!context) {
            cmd = cmds[dataCmdName];
            context = initContext(userId, cmd, msg);
            msg.chat = msg.message.chat;
            msg.message = undefined; // this makes it send a new message instead of editing the old
        }

        cmd = context.cmd;

        if (!cmd) {
            msg.chat = msg.message.chat;
            return msg.sendChatMessage(strings.commands.blakkis.command_not_found);
        }

        // check that command which the data originated is the same as current context
        if (dataCmdName && dataCmdName[0] !== cmd.name) {
            // happens for example if user uses /kalja033 in between inline chat command use
            cmd = cmds[dataCmdName];
            context = initContext(userId, cmd, msg);
            msg.chat = msg.message.chat;
            msg.message = undefined; // this makes it send a new message instead of editing the old
        }

    } else if (cmds[firstWord]) {
        cmd = cmds[firstWord];
        if (msg.chat.type === 'private') {
            context = initContext(userId, cmd, msg); // reinitiate user's contexts in private
        } else {
            context = new contexts.Context(cmd, msg); // otherwise use a dummy context to not lose private context
        }
    } else {
        // first word was not a command, try to find a command by context
        // at the moment only private chats are allowed
        // don't send any messages to avoid replying to replies
        if (msg.chat.type !== Commands.SCOPE_PRIVATE) {
            return Promise.resolve();
        }
        context = retrieveContext(userId, msg);

        if (!context) {
            return msg.sendChatMessage(strings.commands.blakkis.command_not_found);
        }

        cmd = context.cmd;
    }


    // Command has been found with context
    // Execute command

    return utils.hookNewRelic('command/' + cmd.name, function() {
        log.debug((msg.from.username || msg.from.first_name) + ': ' + firstWord);
        if (cmd.scope === Commands.SCOPE_PRIVATE && !context.isPrivateChat()) {
            if (bot_suffix) {
                return Promise.reject(new errors.PrivateCommandUsedInChat(cmd.name));
            } else {
                // do not nag without proper @botname suffix in chats
                return Promise.resolve();
            }
        } else if (cmd.scope === Commands.SCOPE_CHAT && context.isPrivateChat()) {
            return Promise.reject(new errors.ChatCommandUsedInPrivate(cmd.name));
        } else if (context.phase === -1) {
            return Promise.reject(new errors.ContextEnded(cmd.name));
        }
        return users.find(msg.from.id)
            .then((user) => {
                if (!user) {
                    if (cmd.privilege === Commands.PRIVILEGE_ADMIN && msg.from.id !== settings.admin_id) {
                        return Promise.reject(new errors.UserNotAdmin({
                            userId: msg.from.id
                        }));
                    }
                    if (cmd.privilege === Commands.PRIVILEGE_USER) {
                        return Promise.reject(new errors.UserNotFound(user));
                    }
                }
                if (user) {
                    if (cmd.privilege === Commands.PRIVILEGE_ADMIN && !user.isAdmin()) {
                        return Promise.reject(new errors.UserNotAdmin(user));
                    }
                    /*
                        TODO: write test case for this:
                        user has not read terms
                        /tunnus should go through
                    */
                    if (!user.read_terms && cmd.privilege !== Commands.PRIVILEGE_ALL) {
                        return Promise.reject(new errors.UserNotReadTerms(user));
                    }
                    if (user.read_announcements < announcements.length) {
                        const unread_announcements = announcements.slice(user.read_announcements, announcements.length + 1);
                        msg.sendPrivateMessage(strings.commands.blakkis.announcements.format({
                            announcements: unread_announcements.join('\n\n')
                        }));
                        user.updateReadAnnouncements(announcements.length);
                    }
                }
                return Promise.resolve(user);
            })
            .then((user) => {

                if (cmd.type === Commands.TYPE_INLINE) {
                    return Commands.callInline(cmd, context, user, msg, words);
                } else if (cmd.type === Commands.TYPE_SINGLE) {
                    log.debug(`executing singlephase command ${firstWord}`);
                    return cmd.definition(context, msg, words, user);
                } else {
                    log.debug(`executing multiphase command ${firstWord}`);
                    let phase = cmd.definition[context.phase];
                    if (context.phase === 'start' && !context.fetchVariable('_started')) {
                        context.storeVariable('_started', true);
                        return context.sendMessageObj(phase.startMessage);
                    }
                    if (!phase.validateInput(context, msg, words, user)) {
                        return context.sendMessageObj(phase.errorMessage);
                    }
                    log.debug('Executing phase ' + context.phase + ' of usercmd ' + cmd.name);
                    return phase.onValidInput(context, msg, words, user)
                        .then(() => {
                            phase = cmd.definition[context.phase];
                            log.debug('Command executed. New phase & context:');
                            log.debug(phase);
                            log.debug(context);
                            if (!context.hasEnded() && phase && phase.nextPhase) {
                                context.toPhase(phase.nextPhase);
                                let newPhase = cmd.definition[context.phase];
                                return context.sendMessageObj(newPhase.startMessage);
                            } else {
                                return context.end();
                            }
                        });
                }
            })
            .then(() => {
                log.info(`executed cmd ${cmd.name}`);
                return Promise.resolve();
            });
    }).catch((err) => {
        log.error(`Couldn\'t execute cmd ${cmd.name} properly, err message: ${err.message}`);
        return sendErrorMessage(msg, err);
    });
};

Commands.callInline = (cmd, context, user, msg, words) => {
    if (!context.state) {
        // set current state to root object in command tree
        // show root _text
        return cmd.definition.onSelect(context, user, msg, words);
    }
    const curState = context.state;
    // button was pressed, update the keyboard and text
    if (msg.data) {
        const cmdStripped = msg.data.replace(/\/\w+ /, '');
        const nextState = cmdStripped === strings.commands.blakkis.back ? curState.getParent() : curState.getChild(cmdStripped);

        if (nextState) {
            // Check for proper rights here too (do not allow malicious inline command data)
            if (!nextState.isAvailableForUser(context, user)) {
                return;
            }

            curState.onExit(context, user, nextState);
            return nextState.onSelect(context, user, msg, words);
        }
    }

    if (msg.text) {
        return curState.onText(context, user, msg, words);
    }
};