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
    betablakkis.js
    Beta bläkkis command, uses inline chat for all functionality
*/

'use strict';

const Commands = require('../lib/commands.js');
const utils = require('../lib/utils.js');
const constants = require('../constants.js');
const strings = require('../strings.js');
const str_beta = strings.commands.beta;
const alcomath = require('../lib/alcomath.js');

function makeDrinksString(drinks) {
    let list = [];
    for (var i in drinks) {
        let drink = drinks[i];
        let drinkTime = new Date(Date.parse(drink.created));
        let drinkHours = drinkTime.getHours() + '';
        if (drinkHours.length === 1) {
            drinkHours = '0' + drinkHours;
        }
        let drinkMinutes = drinkTime.getMinutes() + '';
        if (drinkMinutes.length === 1) {
            drinkMinutes = '0' + drinkMinutes;
        }
        list.push(drinkHours + ':' + drinkMinutes + ' ' + drink.description);
    }
    return list.join('\n');
}

const betablakkis = {
    _onSelect: (context, user, msg, words) => {
        if (user) {
            return Promise.all([
                user.getBooze(),
                user.getBoozeForLastHours(3)
            ]).then((res) => {
                const drinks = res[0],
                    drinks3h = res[1];
                let ebac = alcomath.calculateEBACFromDrinks(user, drinks);
                let permilles = ebac.permilles;
                let permilles30Min = ebac.permilles30Min;
                let grams = ebac.grams;
                let metabolismRate = alcomath.getUserMetabolismRate(user);
                let time = permilles30Min / metabolismRate;
                time = time > 0 ? time + 0.5 : time;
                let hours = Math.floor(time);
                const permilles_text = str_beta.on_select.format({
                    permilles: utils.roundTo(permilles, 2),
                    permilles30Min: utils.roundTo(permilles30Min, 2),
                    grams: utils.roundTo(grams),
                    standard_drinks: utils.roundTo(grams / constants.STANDARD_DRINK_GRAMS, 2),
                    hours: hours,
                    minutes: ('0' + Math.ceil((time - hours) * 60)).slice(-2)
                });
                const drinks_text = drinks3h.length > 0 ? str_beta.on_select_drinks3h.format({
                    drinkList3h: makeDrinksString(drinks3h)
                }) : '';
                return permilles_text + drinks_text;
            });
        } else {
            return Promise.resolve(str_beta.on_select_nonuser);
        }
    },
    _root: true,
    [str_beta.juo.button_text]: require('./inline/juo.js'),
    [str_beta.tunnus.button_text]: require('./inline/tunnus.js'),
    [str_beta.luo_tunnus.button_text]: require('./inline/tunnus.js'),
    'Tilastot': {
        _text: 'lol stats'
    },
    'Apua': {
        _text: 'lol help'
    }
};

Commands.register('/beta', 'Bläkkisvuohi versio3 - betavaihe', Commands.SCOPE_PRIVATE, Commands.PRIVILEGE_ALL, Commands.TYPE_INLINE, betablakkis);