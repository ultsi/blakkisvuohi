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
    /loglevel
    Allows the admin to set the loglevel
*/
'use strict';
const Commands = require('../lib/commands.js');
const utils = require('../lib/utils.js');
const stats = require('../db/stats.js');
const groups = require('../db/groups.js');
const STANDARD_DRINK_GRAMS = require('../constants.js').STANDARD_DRINK_GRAMS;
const strings = require('../strings.js');

function printStats(context, msg, words, user) {
    const hours = (words[1] && parseInt(words[1])) ? parseInt(words[1]) * 24 : 4 * 365 * 24;
    if (context.isPrivateChat()) {
        return user.getDrinkSumForXHours(hours)
            .then((res) => {
                const sum = res.sum;
                const created = new Date(res.created);
                const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
                const daysBetween = (words[1] && parseInt(words[1])) ? parseInt(words[1]) : Math.round((new Date().getTime() - created.getTime()) / oneDay);
                const grams = sum / 1000.0;
                return context.privateReply(strings.commands.stats.private.format({
                    day_count: daysBetween,
                    grams: utils.roundTo(grams, 1),
                    standard_drinks: utils.roundTo(grams / STANDARD_DRINK_GRAMS, 1),
                    avg_standard_drinks: utils.roundTo((grams / daysBetween / STANDARD_DRINK_GRAMS), 1)
                }));
            });
    } else {
        const group = new groups.Group(msg.chat.id);
        return stats.getGroupStats(group, hours)
            .then((res) => {
                const top10Stats = res.top10UserStats;
                const top10text = top10Stats.map((stats) => utils.decrypt(stats.nick) + ' - ' + stats.count).join('\n');
                const groupDrinkSum = res.groupDrinkSum;
                const firstDrinkCreated = new Date(groupDrinkSum.created);
                const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
                const daysBetween = (words[1] && parseInt(words[1])) ? parseInt(words[1]) : Math.round((new Date().getTime() - firstDrinkCreated.getTime()) / oneDay);
                const grams = groupDrinkSum.sum / 1000.0;
                return context.chatReply(strings.commands.stats.group.format({
                    day_count: daysBetween,
                    grams: utils.roundTo(grams, 1),
                    standard_drinks: utils.roundTo(grams / STANDARD_DRINK_GRAMS, 1),
                    avg_standard_drinks: utils.roundTo((grams / daysBetween / STANDARD_DRINK_GRAMS), 1),
                    top10List: top10text
                }));
            });
    }
}

Commands.register(
    '/stats',
    strings.commands.stats.cmd_description,
    Commands.SCOPE_ALL,
    Commands.PRIVILEGE_USER,
    Commands.TYPE_SINGLE,
    printStats
);