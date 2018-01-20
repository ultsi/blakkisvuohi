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
    /moro
    Adds the user to a group
*/
'use strict';
const Commands = require('../lib/commands.js');
const strings = require('../strings.js');

function moro(context, user, msg, words) {
    if (msg.chat.type === 'private') {
        return Promise.reject(new Error('use in a group'));
    }
    return user.joinGroup(msg.chat.id)
        .then(() => {
            context.end();
            return Promise.resolve(context.chatReply(strings.commands.moro.join_text.format({
                chat_title: msg.chat.title
            })));
        });
}

Commands.registerUserCommand(
    '/moro',
    strings.commands.moro.cmd_description,
    Commands.TYPE_ALL, [moro]
);