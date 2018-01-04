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
const when = require('when');
const log = require('loglevel');
const Commands = require('../lib/commands.js');
const utils = require('../lib/utils.js');
const stats = require('../db/stats.js');
const STANDARD_DRINK_GRAMS = require('../constants.js').STANDARD_DRINK_GRAMS;

function printStats(context, user, msg, words)  {
    let deferred = when.defer();
    const hours = (words[1] && parseInt(words[1])) ? parseInt(words[1]) * 24 : 4 * 365 * 24;
    if (context.isPrivateChat()) {
        user.getDrinkSumForXHours(hours)
            .then((res) => {
                const sum = res.sum;
                const created = new Date(res.created);
                const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
                const daysBetween = (words[1] && parseInt(words[1])) ? parseInt(words[1]) : Math.round((new Date().getTime() - created.getTime()) / oneDay);
                const grams = sum / 1000.0;
                deferred.resolve(context.privateReply('Olet ' + daysBetween + ' päivän aikana tuhonnut ' + utils.roundTo(grams, 0) + ' grammaa alkoholia, joka vastaa ' + utils.roundTo(grams / STANDARD_DRINK_GRAMS, 1) + ' annosta. Keskimäärin olet juonut ' + utils.roundTo((grams / daysBetween / STANDARD_DRINK_GRAMS), 1) + ' annosta per päivä. Hienosti.'));
            }, (err) => {
                log.error(err);
                log.debug(err.stack);
                deferred.reject('Isompi ongelma, ota yhteyttä adminiin.');
            });
    } else {
        stats.getGroupStats(msg.chat.id, hours)
            .then((res) => {
                console.log(res);
                const top10Stats = res.top10UserStats;
                const top10text = top10Stats.map((stats) => stats.nick + ' - ' + stats.count).join('\n');
                const groupDrinkSum = res.groupDrinkSum;
                const firstDrinkCreated = new Date(groupDrinkSum.created);
                const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
                const daysBetween = (words[1] && parseInt(words[1])) ? parseInt(words[1]) : Math.round((new Date().getTime() - firstDrinkCreated.getTime()) / oneDay);
                const grams = groupDrinkSum.sum / 1000.0;
                deferred.resolve(context.chatReply('Tilastoja:\n\nRyhmän jäsenet ovat ' + daysBetween + ' päivän aikana tuhonneet ' + utils.roundTo(grams, 0) + ' grammaa alkoholia, joka vastaa ' + utils.roundTo(grams / STANDARD_DRINK_GRAMS, 1) + ' annosta. Keskimäärin on juotu ' + utils.roundTo((grams / daysBetween / STANDARD_DRINK_GRAMS), 1) + ' annosta per päivä. Hienosti.\n\nTop10 tilastot:\n\n' + top10text));
            }, (err) => {
                log.error(err);
                context.privateReply('Virhe!');
                deferred.resolve();
            });
    }

    return deferred.promise;
}

Commands.registerUserCommand(
    '/stats',
    '/stats - listaa ryhmän tai sinun kulutustilastoja. Lisäämällä numeron komennon perään voit valita, kuinka monelta päivältä taaksepäin haluat tilastot',
    Commands.TYPE_ALL, [printStats]
);