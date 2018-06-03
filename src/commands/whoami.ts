/*
    Bläkkisvuohi, a Telegram bot to help track estimated blood alcohol concentration.
    Copyright (C) 2017  Joonas Ulmanen

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

/*
    /whoami
    If registered with the bot, tells about yourself
*/
'use strict'

import * as Commands from '../lib/commands'
import * as strings from '../strings'

function whoAmI(context, user) {
    return context.privateReply(strings.commands.whoami.reply.format({
        username: user.username,
        user_id: user.userId,
        weight: user.weight,
        height: user.height,
        gender: user.gender,
        created: user.created.toString()
    }))
}

Commands.register(
    '/whoami',
    strings.commands.whoami.cmd_description,
    Commands.SCOPE_PRIVATE,
    Commands.PRIVILEGE_USER,
    Commands.TYPE_SINGLE,
    whoAmI
)