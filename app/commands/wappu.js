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
    /wappu
    Wappu stats
*/
'use strict';
const Commands = require('../lib/commands.js');
const utils = require('../lib/utils.js');
const stats = require('../db/stats.js');
const groups = require('../db/groups.js');
const STANDARD_DRINK_GRAMS = require('../constants.js').STANDARD_DRINK_GRAMS;
const strings = require('../strings.js');

function printWappuStats(context, msg, words, user) {
    const hours = (Date.now() - 1523307600 * 1000) / 1000 / 60 / 60; // from 10.4. 00:00
    if (context.isPrivateChat()) {
        return user.getDrinkSumForXHours(hours)
            .then((res) => {
                const sum = res.sum;
                const created = new Date(res.created);
                const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
                const daysBetween = (words[1] && parseInt(words[1])) ? parseInt(words[1]) : Math.round((new Date().getTime() - created.getTime()) / oneDay);
                const grams = sum / 1000.0;
                return context.privateReply(strings.commands.wappu.private.format({
                    day_count: daysBetween,
                    grams: utils.roundTo(grams, 1),
                    standard_drinks: utils.roundTo(grams / STANDARD_DRINK_GRAMS, 1),
                    avg_standard_drinks: utils.roundTo((grams / daysBetween / STANDARD_DRINK_GRAMS), 1)
                }));
            });
    } else {
        const group = new groups.Group(msg.chat.id);
        return stats.getWappuStats(group, hours)
            .then((res) => {
                const top10Stats = res.top10UserStats;
                const top10text = top10Stats.map((stats) => utils.decrypt(stats.nick) + ' - ' + stats.count).join('\n');
                const groupDrinkSum = res.groupDrinkSum;
                const daysBetween = utils.roundTo(hours / 24, 1);
                const grams = groupDrinkSum.sum / 1000.0;
                const count = groupDrinkSum.count;
                return context.chatReply(strings.commands.wappu.group.format({
                    day_count: daysBetween,
                    grams: utils.roundTo(grams, 1),
                    count: count,
                    standard_drinks: utils.roundTo(grams / STANDARD_DRINK_GRAMS, 1),
                    avg_count: utils.roundTo(count / daysBetween, 1),
                    avg_standard_drinks: utils.roundTo((grams / daysBetween / STANDARD_DRINK_GRAMS), 1),
                    global_drinks_count: res.drinkCount.count,
                    global_drinks_grams: utils.roundTo(res.drinkCount.sum / 1000.0, 0),
                    global_drinks_standard: utils.roundTo(res.drinkCount.sum / 1000.0 / STANDARD_DRINK_GRAMS),
                    top10List: top10text
                }));
            });
    }
}

Commands.register(
    '/wappu',
    strings.commands.wappu.cmd_description,
    Commands.SCOPE_ALL,
    Commands.PRIVILEGE_USER,
    Commands.TYPE_SINGLE,
    printWappuStats
);