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
    /juoma command. Multiple phase command with lots of options
*/
'use strict';

const when = require('when');
const log = require('loglevel').getLogger('commands');
const Commands = require('../lib/commands.js');
const utils = require('../lib/utils.js');
const constants = require('../constants.js');
const strings = require('../strings.js');

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

drinkCommand[0] = function(context, user, msg, words) {
    context.nextPhase();
    return context.privateReplyWithKeyboard('Valitse juoman kategoria', drinkCommand.startKeyboard);
};

drinkCommand[1] = function(context, user, msg, words) {
    if (words[0].toLowerCase() === 'miedot') {
        context.toPhase('miedot');
        return context.privateReplyWithKeyboard(drinkCommand.miedotReply.text, drinkCommand.miedotReply.keyboard);
    } else if (words[0].toLowerCase() === 'tiukat') {
        context.toPhase('tiukat');
        return context.privateReplyWithKeyboard(drinkCommand.tiukatReply.text, drinkCommand.tiukatReply.keyboard);
    } else if (words[0].toLowerCase() === 'oma') {
        context.toPhase('omajuoma');
        return context.privateReplyWithKeyboard('Syötä juoman tilavuusprosentti, esim: 12.5.');
    } else {
        return context.privateReplyWithKeyboard('Väärä valinta, valitse juoman kategoria', drinkCommand.startKeyboard);
    }
};

drinkCommand.miedot = function(context, user, msg, words) {
    if (msg.text.toLowerCase() === drinkCommand.toStartText.toLowerCase()) {
        context.toPhase(1);
        return context.privateReplyWithKeyboard('Valitse juoman kategoria', drinkCommand.startKeyboard);
    }
    const milds = constants.milds;
    let found = null;
    for (let key in milds) {
        if (milds[key].print.toLowerCase() === msg.text.toLowerCase()) {
            found = milds[key];
        }
    }

    if (!found) {
        return context.privateReplyWithKeyboard(drinkCommand.miedotReply.text, drinkCommand.miedotReply.keyboard);
    }
    let deferred = when.defer();
    user.drinkBoozeReturnPermilles(found.mg, found.print, msg)
        .then((permilles) => {
            deferred.resolve(context.privateReply(utils.getRandom(strings.drink_responses) + ' ' + permilles.toFixed(2) + '‰'));
        }, (err) => {
            log.error(err);
            log.debug(err.stack);
            deferred.reject('Isompi ongelma, ota yhteyttä adminiin.');
        });
    context.end();
    return deferred.promise;
};

drinkCommand.tiukat = function(context, user, msg, words) {
    if (msg.text.toLowerCase() === drinkCommand.toStartText.toLowerCase()) {
        context.toPhase(1);
        return context.privateReplyWithKeyboard('Valitse juoman kategoria', drinkCommand.startKeyboard);
    }
    const booze = constants.booze;
    let found = null;
    for (let key in booze) {
        if (booze[key].print.toLowerCase() === msg.text.toLowerCase()) {
            found = booze[key];
        }
    }

    if (!found) {
        return context.privateReplyWithKeyboard(drinkCommand.tiukatReply.text, drinkCommand.tiukatReply.keyboard);
    }
    let deferred = when.defer();
    user.drinkBoozeReturnPermilles(found.mg, found.print, msg)
        .then((permilles) => {
            deferred.resolve(context.privateReply(utils.getRandom(strings.drink_responses) + ' ' + permilles.toFixed(2) + '‰'));
        }, (err) => {
            log.error(err);
            log.debug(err.stack);
            deferred.reject('Isompi ongelma, ota yhteyttä adminiin.');
        });
    context.end();
    return deferred.promise;
};

drinkCommand.omajuoma = function(context, user, msg, words) {
    let vol = parseFloat(words[0]);
    if (!utils.isValidFloat(vol)) {
        return context.privateReply('Prosentti on väärin kirjoitettu. Älä käytä pilkkua.');
    } else if (vol <= 0) {
        return context.privateReply('Alle 0-prosenttista viinaa ei kelloteta. Hölmö.');
    } else if (vol > 100) {
        return context.privateReply('Yli 100-prosenttista viinaa ei kelloteta. Hölmö.');
    }

    context.storeVariable('vol', vol);
    context.toPhase('omajuomaEnd');
    return context.privateReply('Hyvä, seuraavaksi syötä viinan määrä senttilitroissa.');
};

drinkCommand.omajuomaEnd = function(context, user, msg, words) {
    let centiliters = parseInt(words[0]);
    if (!utils.isValidInt(centiliters)) {
        return context.privateReply('Kirjoita määrä senttilitroissa numerona.');
    } else if (centiliters < 1) {
        return context.privateReply('Alle 1 senttilitraa on liian vähän.');
    } else if (centiliters >= 250) {
        return context.privateReply('Yli 2.5 litraa viinaa? Ei käy.');
    }

    // Everything ok, use the variables
    let vol = context.fetchVariable('vol');
    let mg = constants.calcAlcoholMilligrams(vol / 100.0, centiliters / 100.0);
    let deferred = when.defer();
    user.drinkBoozeReturnPermilles(mg, 'Oma juoma - ' + centiliters + 'cl ' + vol + '%', msg)
        .then((permilles) => {
            deferred.resolve(context.privateReply(utils.getRandom(strings.drink_responses) + ' ' + permilles.toFixed(2) + '‰'));
        }, (err) => {
            log.error(err);
            log.debug(err.stack);
            deferred.reject('Isompi ongelma, ota yhteyttä adminiin.');
        });
    context.end();
    return deferred.promise;
};

Commands.registerUserCommand(
    '/juoma', 
    '/juoma - lisää yksi juoma tilastoihin', 
    Commands.TYPE_PRIVATE, 
    drinkCommand
);