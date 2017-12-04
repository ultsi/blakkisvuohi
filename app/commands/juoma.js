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
    /juoma
    Multiple phase command with lots of options what to drink
*/
'use strict';

const when = require('when');
const log = require('loglevel').getLogger('commands');
const Commands = require('../lib/commands.js');
const utils = require('../lib/utils.js');
const constants = require('../constants.js');
const strings = require('../strings.js');
const message = require('../lib/message.js');

let drinkCommand = {};
drinkCommand.toStartText = 'Alkuun';
drinkCommand.startKeyboard = [
    ['Miedot', 'Tiukat', 'Oma']
];
drinkCommand.miedotReply = {
    text: 'Valitse mieto',
    keyboard: [
        [constants.milds.beercan.print, constants.milds.beer4.print, constants.milds.beer05.print],
        [constants.milds.beer04.print, constants.milds.beerpint.print, constants.milds.lonkero.print],
        [constants.milds.wine12.print, constants.milds.wine16.print, drinkCommand.toStartText]
    ]
};

drinkCommand.tiukatReply = {
    text: 'Valitse tiukka',
    keyboard: [
        [constants.booze.mild.print, constants.booze.medium.print, constants.booze.basic.print, drinkCommand.toStartText]
    ]
};

function saveDrink(context, user, milligrams, drinkName) {
    let deferred = when.defer();
    user.drinkBoozeReturnPermilles(milligrams, drinkName)
        .then((permilles) => {
            deferred.resolve(context.privateReply(utils.getRandom(strings.drink_responses) + ' ' + permilles.toFixed(2) + '‰'));
        }, (err) => {
            log.error(err);
            log.debug(err.stack);
            deferred.reject('Isompi ongelma, ota yhteyttä adminiin.');
        });
    return deferred.promise;
}

let command ={
    [0]: {
        startMessage: message.PrivateKeyboardMessage('Valitse juoman kategoria', drinkCommand.startKeyboard),
        validateInput: (context, user, msg, words) => {
            return drinkCommand.startKeyboard[0].find((x) => x.toLowerCase() === msg.text.toLowerCase());
        },
        onValidInput: (context, user, msg, words) => {
            let deferred = when.defer();
            context.toPhase(words[0].toLowerCase());
            deferred.resolve();
            return deferred.promise;
        },
        nextPhase: 0,
        errorMessage: message.PrivateKeyboardMessage('Valitse juoman kategoria', drinkCommand.startKeyboard)
    },
    miedot: {
        startMessage: message.PrivateKeyboardMessage(drinkCommand.miedotReply.text, drinkCommand.miedotReply.keyboard),
        validateInput: (context, user, msg, words) => {
            return drinkCommand.miedotReply.keyboard.find((row) => row.find((col) => col.toLowerCase() === msg.text.toLowerCase()));
        },
        onValidInput: (context, user, msg, words) => {
            if(words[0].toLowerCase() === drinkCommand.toStartText.toLowerCase()){
                let deferred = when.defer();
                context.toPhase(0);
                deferred.resolve();
                return deferred.promise;
            }
            const milds = constants.milds;
            let drink = null;
            for (let key in milds) {
                if (milds[key].print.toLowerCase() === msg.text.toLowerCase()) {
                    drink = milds[key];
                }
            }
            context.toPhase('END');
            return saveDrink(context, user, drink.mg, drink.print);
        },
        nextPhase: 'miedot',
        errorMessage: message.PrivateKeyboardMessage(drinkCommand.miedotReply.text, drinkCommand.miedotReply.keyboard)
    },
    tiukat: {
        startMessage: message.PrivateKeyboardMessage(drinkCommand.tiukatReply.text, drinkCommand.tiukatReply.keyboard),
        validateInput: (context, user, msg, words) => {
            return drinkCommand.tiukatReply.keyboard.find((row) => row.find((col) => col.toLowerCase() === msg.text.toLowerCase()));
        },
        onValidInput: (context, user, msg, words) => {
            if(words[0].toLowerCase() === drinkCommand.toStartText.toLowerCase()){
                let deferred = when.defer();
                context.toPhase(0);
                deferred.resolve();
                return deferred.promise;
            }

            const booze = constants.booze;
            let drink = null;
            for (let key in booze) {
                if (booze[key].print.toLowerCase() === msg.text.toLowerCase()) {
                    drink = booze[key];
                }
            }

            context.toPhase('END');
            return saveDrink(context, user, drink.mg, drink.print);
        },
        nextPhase: 'tiukat',
        errorMessage: message.PrivateKeyboardMessage(drinkCommand.tiukatReply.text, drinkCommand.tiukatReply.keyboard)
    },
    oma: {
        startMessage: message.PrivateMessage('Syötä juoman tilavuusprosentti, esim: 12.5.'),
        validateInput: (context, user, msg, words) => {
            let vol = parseFloat(words[0]);
            return utils.isValidFloat(vol) && vol > 0 || vol < 100;
        },
        onValidInput: (context, user, msg, words) => {
            let deferred = when.defer();
            context.storeVariable('vol', parseFloat(words[0]));
            context.toPhase('omacl');
            deferred.resolve();
            return deferred.promise;
        },
        nextPhase: 'oma',
        errorMessage: message.PrivateMessage('Syötä juoman tilavuusprosentti, esim: 12.5.')
    },
    omacl: {
        startMessage: message.PrivateMessage('Syötä juoman määrä senttilitroissa, esim: 4'),
        validateInput: (context, user, msg, words) => {
            let cl = parseInt(words[0]);
            return utils.isValidInt(cl) && cl > 0 || cl < 250;
        },
        onValidInput: (context, user, msg, words) => {
            let vol = context.fetchVariable('vol');
            let cl = parseInt(words[0]);
            let mg = constants.calcAlcoholMilligrams(vol / 100.0, cl / 100.0);
            context.toPhase('END');
            return saveDrink(context, user, mg, 'Oma juoma - ' + cl + 'cl ' + vol + '%');
        },
        nextPhase: 'omacl',
        errorMessage: message.PrivateMessage('Syötä juoman määrä senttilitroissa, esim: 4')
    },
    END: {
        /* empty for ending the command */
    }
};

Commands.registerUserCommandV2(
    '/juoma',
    '/juoma - lisää yksi juoma tilastoihin',
    Commands.TYPE_PRIVATE,
    command
);