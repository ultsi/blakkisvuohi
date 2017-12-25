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
    /promillet
    In chat:
        Prints a sorted list of users' permilles
    In private:
        Returns information about current alcohol levels
*/
'use strict';
const when = require('when');
const log = require('loglevel').getLogger('commands');
const Commands = require('../lib/commands.js');
const alcomath = require('../lib/alcomath.js');
const groups = require('../db/groups.js');

function listPermilles(context, user, msg, words) {
    let deferred = when.defer();
    if (msg.chat.type === 'private') {
        user.getBooze()
            .then((drinks) => {
                try {
                    let ebac = alcomath.calculateEBACFromDrinks(user, drinks);
                    let permilles = ebac.permilles;
                    let grams = ebac.grams;
                    let metabolismRate = alcomath.getUserMetabolismRate(user);
                    let time = permilles / metabolismRate;
                    let hours = Math.floor(time);
                    let minutes = ('0' + Math.ceil((time - hours) * 60)).slice(-2);
                    deferred.resolve(context.privateReply('Olet ' + permilles.toFixed(2) + '‰ humalassa. Veressäsi on ' + grams.toFixed(2) + ' grammaa alkoholia, joka vastaa ' + (grams / 12.2).toFixed(2) + ' annosta. Olet selvinpäin ' + hours + 'h' + minutes + 'min päästä.'));
                } catch (err) {
                    log.error(err);
                    log.debug(err.stack);
                    deferred.reject('Isompi ongelma, ota yhteyttä adminiin.');
                }
            }, (err) => {
                log.error(err);
                log.debug(err.stack);
                deferred.reject('Isompi ongelma, ota yhteyttä adminiin.');
            });
    } else {
        let group = new groups.Group(msg.chat.id);
        group.getPermillesListing()
            .then((permillesListing) => {
                let text = permillesListing.map(user => user[0] + '... ' + user[1].toFixed(2) + '‰ (' + user[2].toFixed(1) + '/' + user[3].toFixed(1) + ')');
                text = 'Käyttäjä...‰ (annoksia 12h/24h)\n\n' + text.join('\n');
                text = msg.chat.title + ' -kavereiden rippitaso:\n' + text;
                deferred.resolve(context.chatReply(text));
            }, (err) => {
                log.error(err);
                log.debug(err.stack);
                deferred.reject('Isompi ongelma, ota yhteyttä adminiin.');
            });
    }
    context.end();
    return deferred.promise;
}

Commands.registerUserCommand('/promillet', '/promillet - listaa kuinka paljon promilleja sinulla tai chatissa olevilla suunnilleen on.', Commands.TYPE_ALL, [listPermilles]);