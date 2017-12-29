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

const when = require('when');
const log = require('loglevel').getLogger('commands');
const Commands = require('../lib/commands.js');
const alcomath = require('../lib/alcomath.js');
const groups = require('../db/groups.js');
const users = require('../db/users.js');
const linechart = require('../lib/linechart.js');


function randomColor() {
    var r = Math.round(Math.random() * 255);
    var g = Math.round(Math.random() * 255);
    var b = Math.round(Math.random() * 255);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
}

function kuvaaja(context, user, msg, words) {
    let deferred = when.defer();
    log.debug('Trying to form graph image');

    let graphTitle = 'Promillekuvaaja feat. ' + msg.chat.title;

    let group = new groups.Group(msg.chat.id);
    group.getDrinkTimes(msg.chat.id)
        .then((drinksByUser) => {
            try  {
                const lastNHours = 24;
                const predictNHours = 12;
                let labels = [];
                let datasets = [];
                /*let trimFromStart = [];
                let trimFromEnd = [];*/
                for (let userId in drinksByUser) {
                    let details = drinksByUser[userId];
                    let user = new users.User(details.userid, details.nick, details.weight, details.gender);
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

                    let color = randomColor();
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

                linechart.getLineGraphBuffer({
                        labels: labels,
                        datasets: datasets
                    }, graphTitle)
                    .then((buffer) => {
                        deferred.resolve(context.photoReply(buffer, graphTitle));
                    }, (err) => {
                        log.error(err);
                        log.debug(err.stack);
                        deferred.resolve(context.chatReply('Kuvan muodostus epäonnistui!'));
                    });
            } catch (err)  {
                log.error(err);
                log.debug(err.stack);
                deferred.reject('Isompi ongelma, ota yhteyttä adminiin.');
            }
        }, (err) => {
            log.error(err);
            log.debug(err.stack);
            deferred.reject('Isompi ongelma, ota yhteyttä adminiin.');
        });

    context.end();
    return deferred.promise;
}

Commands.registerUserCommand(
    '/kuvaaja',
    '/kuvaaja - Näyttää ryhmän 24h tapahtumat kuvaajana.',
    Commands.TYPE_ALL, [kuvaaja]
);