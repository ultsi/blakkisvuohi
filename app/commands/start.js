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
const strings = require('../strings.js');
const str_start = strings.commands.start;
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
            return user.getEBACWithDrinksForLastHours(3)
                .then((res) => {
                    const ebac = res.ebac,
                        last_drinks = res.last_drinks;
                    const hours = Math.floor(ebac.burn_hours);
                    const drinks_text = last_drinks.length > 0 ? str_start.on_select_drinks3h.format({
                        drinkList3h: makeDrinksString(last_drinks)
                    }) : '';
                    return str_start.on_select.format({
                        grams: utils.roundTo(ebac.grams, 0),
                        standard_drinks: alcomath.toStandardDrinks(ebac.grams, 2),
                        hours: hours,
                        minutes: ('0' + Math.ceil((ebac.burn_hours - hours) * 60)).slice(-2),
                        drink_list: drinks_text
                    });
                });
        } else {
            return Promise.resolve(str_start.on_select_nonuser);
        }
    },
    _headerTitle: str_start.header_title,
    _formHeader: (context, user) => {
        if (user) {
            return user.getEBACWithDrinksForLastHours(3)
                .then((res) => {
                    const ebac = res.ebac;
                    return str_start.header_user.format({
                        permilles: utils.roundTo(ebac.permilles, 2),
                        permilles30Min: utils.roundTo(ebac.permilles30Min, 2)
                    });
                });
        } else {
            return Promise.resolve(str_start.header_nonuser);
        }
    },
    _root: true,
    [str_start.juo.button_text]: require('./start/juo.js'),
    [str_start.luo_tunnus.button_text]: require('./start/luo_tunnus.js'),
    [str_start.tilastoja.button_text]: require('./start/tilastoja.js'),
    [str_start.asetukset.button_text]: require('./start/asetukset.js'),
    [str_start.help.button_text]: require('./start/help.js')
};

Commands.register('/start', 'Bläkkisvuohi v3', Commands.SCOPE_PRIVATE, Commands.PRIVILEGE_ALL, Commands.TYPE_INLINE, betablakkis);