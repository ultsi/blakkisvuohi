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
    /poistu
    Removes the user from a group
*/
'use strict';
const Commands = require('../lib/commands.js');
const strings = require('../strings.js');

function poistu(context, msg, words, user) {
    return user.leaveGroup(msg.chat.id)
        .then(() => {
            context.end();
            return context.chatReply(strings.commands.poistu.leave_text.format({
                chat_title: msg.chat.title
            }));
        });
}

Commands.register(
    '/poistu',
    strings.commands.poistu.cmd_description,
    Commands.SCOPE_CHAT,
    Commands.PRIVILEGE_USER,
    Commands.TYPE_SINGLE,
    poistu
);