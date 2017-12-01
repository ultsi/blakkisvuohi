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
const when = require('when');
const log = require('loglevel').getLogger('commands');
const Commands = require('../lib/commands.js');

function moro(context, user, msg, words)  {
    let deferred = when.defer();
    if (msg.chat.type === 'private') {
        deferred.reject('Käytä tätä komentoa ryhmässä!');
        return deferred.promise;
    }
    user.joinGroup(msg)
        .then(() => {
            deferred.resolve(context.chatReply('Rippaa rauhassa kera ' + msg.chat.title + ' -kavereiden.'));
        }, (err) => {
            log.error(err);
            log.debug(err.stack);
            deferred.resolve(context.chatReply('Rippaa rauhassa kera ' + msg.chat.title + ' -kavereiden.'));
        });
    context.end();
    return deferred.promise;
}

Commands.registerUserCommand(
    '/moro', 
    '/moro - Lisää sinut ryhmään mukaan.', 
    Commands.TYPE_ALL, 
    [moro]
);
