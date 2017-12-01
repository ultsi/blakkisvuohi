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
    /kulutus <days>
    Prints historical data about consumption
*/
'use strict';
const when = require('when');
const log = require('loglevel').getLogger('commands');
const Commands = require('../lib/commands.js');
const groups = require('../db/groups.js');

function kulutus(context, user, msg, words) {
    let deferred = when.defer();
    let hours = (words[1] && parseInt(words[1])) ? parseInt(words[1]) * 24 : 4 * 365 * 24;
    if (context.isPrivateChat()) {
        user.getDrinkSumForXHours(hours)
            .then((res) => {
                let sum = res.sum;
                let created = new Date(res.created);
                let oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
                let daysBetween = (words[1] && parseInt(words[1])) ? parseInt(words[1]) : Math.round((new Date().getTime() - created.getTime()) / oneDay);
                let grams = sum / 1000.0;
                deferred.resolve(context.privateReply('Olet ' + daysBetween + ' päivän aikana tuhonnut ' + Math.round(grams) + ' grammaa alkoholia, joka vastaa ' + Math.round(grams / 12.2) + ' annosta. Keskimäärin olet juonut ' + Math.round((grams / daysBetween / 12.2)) + ' annosta per päivä. Hienosti.'));
            }, (err) => {
                log.error(err);
                log.debug(err.stack);
                deferred.reject('Isompi ongelma, ota yhteyttä adminiin.');
            });
    } else {
        let group = new groups.Group(msg.chat.id);
        group.getDrinkSumForXHours(hours)
            .then((res) => {
                let sum = res.sum;
                let created = new Date(res.created);
                let oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
                let daysBetween = (words[1] && parseInt(words[1])) ? parseInt(words[1]) : Math.round((new Date().getTime() - created.getTime()) / oneDay);
                let grams = sum / 1000.0;
                deferred.resolve(context.chatReply('Ryhmän jäsenet ovat ' + daysBetween + ' päivän aikana tuhonneet ' + Math.round(grams) + ' grammaa alkoholia, joka vastaa ' + Math.round(grams / 12.2) + ' annosta. Keskimäärin on juotu ' + Math.round((grams / daysBetween / 12.2)) + ' annosta per päivä. Hienosti.'));
            }, (err) => {
                log.error(err);
                log.debug(err.stack);
                deferred.reject(err);
            });
    }
    context.end();
    return deferred.promise;
}

Commands.registerUserCommand(
    '/kulutus',
    '/kulutus <päivissä> - listaa kulutus. Voit myös antaa päivät parametrina, jolloin näet kulutuksen viime päiviltä.',
    Commands.TYPE_ALL, [kulutus]
);