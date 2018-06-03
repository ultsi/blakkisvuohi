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
    /loglevel
    Allows the admin to set the loglevel
*/
'use strict'
import * as stats from '../db/stats'
import * as Commands from '../lib/commands'
import * as utils from '../lib/utils'
import * as strings from '../strings'

function printAdminStats(context) {
    return stats.getGlobalStats()
        .then((res) => {
            const top10text = res.top10UserStats.map((s) => utils.decrypt(s.nick) + ' - ' + s.count).join('\n')
            return context.privateReply(strings.commands.admin_stats.stats_text.format({
                usersCount: res.usersCount,
                activeUsers14DaysCount: res.activeUsers14DaysCount,
                activeUsers7DaysCount: res.activeUsers7DaysCount,
                groupsCount: res.groupsCount,
                activeGroups14DaysCount: res.activeGroups14DaysCount,
                activeGroups7DaysCount: res.activeGroups7DaysCount,
                top10List: top10text,
                global_drinks_count: res.drinkCount
            }))
        })
}

Commands.register(
    '/admin_stats',
    strings.commands.admin_stats.cmd_description,
    Commands.SCOPE_PRIVATE,
    Commands.PRIVILEGE_ADMIN,
    Commands.TYPE_SINGLE,
    printAdminStats,
)
