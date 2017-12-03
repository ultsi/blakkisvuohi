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

const when = require('when');
const log = require('loglevel').getLogger('commands');
const Commands = require('../lib/commands.js');
const utils = require('../lib/utils.js');
const message = require('../lib/message.js');
const constants = require('../constants.js');
const strings = require('../strings.js');

let command = {

    [0]: {
        startReply: strings.jalkikellotus.start,
        validateInput: (context, user, msg, words) => {
            let hours = parseFloat(words[0]);
            return utils.isValidFloat(hours) && hours > 0 && hours < 24;
        },
        onValidInput: (context, user, msg, words) => {
            context.storeVariable('hours', parseFloat(words[0]));
        },
        nextPhase: 'inputDrinks',
        errorReply: strings.jalkikellotus.hours_error
    },

    inputDrinks: {
        startReply: strings.jalkikellotus.input_drinks_start,
        validateInput: (context, user, msg, words) => {
            if (words[0] === 'stop') {
                return true;
            }
            if (words.length < 3 ||  words.length % 3 !== 0) {
                return false;
            }

            // Validate each word triple
            for (let i = 0; i < words.length; i += 3) {
                let name = words[i];
                let centiliters = parseFloat(words[i + 1]);
                let vol = parseFloat(words[i + 2]);
                if (!utils.isValidFloat(centiliters) ||  !utils.isValidFloat(vol) ||
                    centiliters < 0 ||  centiliters > 250 ||
                    vol < 0 || vol >= 100)
                {
                    context.privateReply('Tarkista juoman ' + name + ' senttilitrat ja tilavuus');
                    return false;
                }
            }

            return true;
        },
        onValidInput: (context, user, msg, words) => {
            // Skip to end if first word is 'stop'
            if (words[0] === 'stop') {
                return context.skipToPhase('end');
            }

            let drinks = context.fetchVariable('drinks') ||  [];
            for(let i = 0; i < words.length; i += 3){
                drinks.push({
                    name: words[i],
                    centiliters: parseFloat(words[1]),
                    vol: parseFloat(words[2])
                });
            }
            context.storeVariable('drinks', drinks);
        },
        nextPhase: 'inputDrinks',
        errorReply: strings.jalkikellotus.input_drinks_error
    },

    end: (context, user, msg, words) => {
        // try to save the drinks etc
        let hours = context.fetchVariable('hours');
        let drinks = context.fetchVariable('drinks');
        return context.privateReply('Halusit tallentaa seuraavat juomat viimeiseltä ' + hours + 'tunnilta.\n' + drinks.map((d) => d[0] + ' ' + d[1] + 'cl ' + d[2] + '%').join('\n'));
    }
};

Commands.registerUserCommandV2(
    '/jalkikellotus',
    strings.jalkikellotus.cmd_text,
    Commands.TYPE_PRIVATE,
    command
);