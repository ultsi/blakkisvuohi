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

const utils = require('./utils.js');
const users = require('../db/users.js');
const contexts = require('./context.js');

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
            .then(function(user) {
                try {
                    phaseFunc(context, user, msg, words)
                        .then(function(res) {
                            console.log('Phase ' + context.phase + ' of cmd ' + cmd.name + ' executed perfectly.');
                        }, function(err) {
                            console.error('Error executing cmd function "' + cmd.name + '" phase ' + context.phase + '! ' + err + ' trace: ' + err.stack);
                            msg.sendPrivateMsg('Virhe: Komennon käyttö: ' + cmd.help);
                        });
                } catch (err) {
                    console.error('Couldn\'t execute cmd function "' + cmd.name + '" phase ' + context.phase + '! ' + err + ' trace: ' + err.stack);
                    msg.sendPrivateMsg('Virhe: Komennon käyttö: ' + cmd.help);
                }
            }, function(err) {
                console.error('Couldn\'t find user for cmd "' + cmd.name + '" phase ' + context.phase + '! ' + err + ' trace: ' + err.stack);
                msg.sendPrivateMsg('Virhe: Komennon käyttö: ' + cmd.help);
            });
    } else {
        return phaseFunc(context, msg, words)
            .then(function(res) {
                console.log('Phase ' + context.phase + ' of cmd ' + cmd.name + ' executed perfectly.');
            }, function(err) {
                console.error('Couldn\'t execute cmd "' + cmd.name + '" phase ' + context.phase + '! ' + err + ' trace: ' + err.stack);
                msg.sendPrivateMsg('Virhe: Komennon käyttö: ' + cmd.help);
            });
    }
}

function printHelp(msg) {
    let cmdstr = 'BläkkisVuohi auttaa sinua ja ystäviäsi seuraamaan rippauksesi (lue: promillejesi) tasoa. Luo ensimmäiseksi tunnus komennolla /luotunnus. Tunnuksen luomisen jälkeen voit alkaa kellottamaan juomia sisään komennolla /juoma. Annan sinulle arvioita rippauksesta komennolla /promillet. Minut voi myös lisätä ryhmään, jolloin kerron /promillet-komennolla kaikkien ryhmässä olevien rippitasot. Jokaisen ryhmäläisen täytyy kuitenkin sanoa ryhmässä /moro, jotta he pääsevät rippilistaukseen mukaan.\n\nKomennot:\n';
    for (var i in cmds) {
        cmdstr += cmds[i].help + '\n';
    }
    return msg.sendPrivateMsg(cmdstr);
}

Commands.call = function call(firstWord, msg, words) {
    utils.attachMethods(msg);
    const userId = msg.from.id;

    // Print command list
    if (firstWord === '/komennot' || firstWord === '/start' || firstWord === '/help') {
        return printHelp(msg);
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
            console.log('Couldn\'t execute cmd "' + cmd.name + '"! ' + err + ' trace: ' + err.stack);
            return msg.sendChatMsg('Virhe! Komennon käyttö: ' + cmd.help);
        }
    } else {
        const context = retrieveContext(userId, msg);
        if (!context) {
            return msg.sendChatMsg('Aloita käyttö kirjoittamalla /help');
        }

        const cmd = context.cmd;
        try {
            if (!context.isPrivateChat()) {
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