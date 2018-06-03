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
    /kuvaaja
    TODO: Piece of shit code that needs to be fixed
*/
'use strict';

const log = require('loglevel').getLogger('commands');
const Commands = require('../lib/commands.js');
const alcomath = require('../lib/alcomath.js');
const utils = require('../lib/utils.js');
const groups = require('../db/groups.js');
const users = require('../db/users.js');
const linechart = require('../lib/linechart.js');
const strings = require('../strings.js');


function kuvaaja(context, msg, words, user) {
    log.debug('Trying to form graph image');

    const graphTitle = strings.commands.kuvaaja.graph_title.format({
        chat_title: msg.chat.title || user.username
    });
    context.end();

    const group = new groups.Group(msg.chat.id);
    const drinkTimes = context.isPrivateChat() ? user.getDrinkTimesByUser() : group.getDrinkTimesByUser();

    return drinkTimes.then((drinksByUser) => {
            const lastNHours = 24;
            const predictNHours = 12;
            let labels = [];
            let datasets = [];
            /*let trimFromStart = [];
            let trimFromEnd = [];*/
            let colors = utils.getColorSet(drinksByUser.length);
            for (let userId in drinksByUser) {
                let details = drinksByUser[userId];
                let user = new users.User(details.userid, details.nick, details.weight, details.gender, details.height);
                let permillesByHour = alcomath.calculateEBACByHourFromDrinks(user, details.drinks, lastNHours, predictNHours);
                let permillesLastNHours = [];
                let permillesPredictNHours = [];
                for (let i = 0; i < permillesByHour.length; i += 1) {
                    if (labels.length < permillesByHour.length) {
                        labels.push(permillesByHour[i].hour);
                    }
                    if (i <= lastNHours) {
                        permillesLastNHours[i] = permillesByHour[i].permilles;
                    }
                    if (i >= lastNHours) {
                        permillesPredictNHours[i] = permillesByHour[i].permilles;
                    }
                    /*
                    // Trim start & end if no data (i.e. 0)
                    if (permillesByHour[i].permilles === 0) {
                        if (!trimFromStart[userId] || trimFromStart[userId] === i - 1) {
                            trimFromStart[userId] = i;
                        }
                    } else {
                        trimFromEnd[userId] = i + 1;
                    }*/
                }

                let randomColorI = Math.floor(Math.random() * colors.length);
                let color = colors.splice(randomColorI, 1);
                color = 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')';
                datasets.push({
                    label: details.nick,
                    data: permillesLastNHours,
                    fill: false,
                    backgroundColor: color,
                    borderColor: color
                });
                datasets.push({
                    label: '',
                    data: permillesPredictNHours,
                    fill: false,
                    backgroundColor: color,
                    borderColor: color,
                    borderDash: [5, 15]
                });
            }
            /*let trimFromStartMin = trimFromStart.reduce((x, y) => x <= y ? x : y);
            let trimFromEndMax = trimFromEnd.reduce((x, y) => x >= y ? x : y);
            trimFromStartMin = trimFromStartMin <= 1 ? 0 : trimFromStartMin - 2;
            trimFromEndMax = trimFromEndMax >= labels.length - 2 ? labels.length - 2 : trimFromEndMax + 2;

            // force trimFromEndMax to current hour
            trimFromEndMax = trimFromEndMax < lastNHours + 1 ? lastNHours + 1 : trimFromEndMax;

            // Trim datasets
            for (let i = 0; i < datasets.length; i += 1) {
                datasets[i].data = datasets[i].data.slice(trimFromStartMin, trimFromEndMax);
            }
            labels = labels.slice(trimFromStartMin, trimFromEndMax);*/

            return linechart.getLineGraphBuffer({
                labels: labels,
                datasets: datasets
            }, graphTitle);
        })
        .then((buffer) => context.photoReply(buffer, graphTitle));
}

Commands.register(
    '/kuvaaja',
    strings.commands.kuvaaja.cmd_description,
    Commands.SCOPE_ALL,
    Commands.PRIVILEGE_USER,
    Commands.TYPE_SINGLE,
    kuvaaja
);