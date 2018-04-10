/*
    Bläkkisvuohi, a Telegram bot to help track estimated blood alcohol concentration.
    Copyright (C) 2017 Joonas Ulmanen

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
    /jalkikellotus
    Multiple phase command to save forgotten drinks
    Uses version 2 definition model of commands
*/
'use strict';

const log = require('loglevel').getLogger('commands');
const Commands = require('../lib/commands.js');
const utils = require('../lib/utils.js');
const message = require('../lib/message.js');
const constants = require('../constants.js');
const strings = require('../strings.js');

let command = {

    start: {
        startMessage: message.PrivateMessage(strings.commands.jalkikellotus.start),
        validateInput: (context, msg, words, user) => {
            let hours = utils.parseFloat(words[0]);
            return utils.isValidFloat(hours) && hours > 0 && hours < 24;
        },
        onValidInput: (context, msg, words, user) => {
            context.storeVariable('hours', utils.parseFloat(words[0]));
            context.storeVariable('drinks', []);
            return Promise.resolve();
        },
        nextPhase: 'inputDrinks',
        errorMessage: message.PrivateMessage(strings.commands.jalkikellotus.hours_error)
    },

    inputDrinks: {
        startMessage: message.PrivateMessage(strings.commands.jalkikellotus.input_drinks_start),
        validateInput: (context, msg, words, user) => {
            if (words[0].toLowerCase() === 'stop') {
                return true;
            }
            if (words.length < 2 || words.length % 2 !== 0) {
                return false;
            }

            // Validate each word tuple
            for (let i = 0; i < words.length; i += 2) {
                let name = strings.commands.jalkikellotus.drink_name;
                let centiliters = utils.parseFloat(words[i]);
                let vol = utils.parseFloat(words[i + 1]);
                if (!utils.isValidFloat(centiliters) || !utils.isValidFloat(vol) ||
                    centiliters < 0 || centiliters > 250 ||
                    vol < 0 || vol >= 100) {
                    context.privateReply(strings.commands.jalkikellotus.input_drinks_drink_error.format({
                        drink: i/2+1
                    }));
                    return false;
                }
            }

            return true;
        },
        onValidInput: (context, msg, words, user) => {
            // Skip to end if first word is 'stop'
            if (words[0].toLowerCase() !== 'stop') {
                let drinks = context.fetchVariable('drinks');
                for (let i = 0; i < words.length; i += 2) {
                    drinks.push({
                        name: strings.commands.jalkikellotus.drink_name,
                        centiliters: utils.parseFloat(words[i]),
                        vol: utils.parseFloat(words[i+1])
                    });
                }
                context.storeVariable('drinks', drinks);
                return context.privateReply(strings.commands.jalkikellotus.input_drinks_drink_saved);
            }

            let hours = context.fetchVariable('hours');
            let drinks = context.fetchVariable('drinks');
            drinks = drinks.map((d) => {
                return {
                    text: d.name + ' ' + d.centiliters + 'cl ' + d.vol + '%',
                    mg: constants.calcAlcoholMilligrams(d.vol / 100, d.centiliters / 100)
                };
            });

            context.toPhase('END');
            return user.drinkBoozeLate(drinks, hours)
                .then((ebac) => {
                    const permilles = ebac.permilles;
                    const permilles30Min = ebac.permilles30Min;
                    return context.privateReply(utils.getRandomFromArray(strings.drink_responses) + ' ' + strings.short_permilles_text.format({
                        permilles: utils.roundTo(permilles, 2),
                        permilles30Min: utils.roundTo(permilles30Min, 2)
                    }));
                });
        },
        nextPhase: 'inputDrinks',
        errorMessage: message.PrivateMessage(strings.commands.jalkikellotus.input_drinks_error)
    },
    END: {
        /* empty for ending the command */
    }
};

Commands.register(
    '/jalkikellotus',
    strings.commands.jalkikellotus.cmd_description,
    Commands.SCOPE_PRIVATE,
    Commands.PRIVILEGE_USER,
    Commands.TYPE_MULTI,
    command
);