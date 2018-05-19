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
    tilastoja.js
    Inline menu for stats
*/

'use strict';

const strings = require('../../strings.js');
const constants = require('../../constants.js');
const str_tilastoja = strings.commands.start.tilastoja;
const utils = require('../../lib/utils.js');

function statsForDays(context, user, msg, words, days) {
    return user.getDrinkSumForXHours(days ? days * 24 : 4 * 365 * 24)
        .then((res) => {
            const sum = res.sum;
            const created = new Date(res.created);
            const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
            const daysBetween = (days) ? parseInt(days) : Math.ceil((new Date().getTime() - created.getTime()) / oneDay);
            const grams = sum / 1000.0;
            return str_tilastoja.kulutus.on_select.format({
                day_count: daysBetween,
                grams: utils.roundTo(grams, 1),
                standard_drinks: utils.roundTo(grams / constants.STANDARD_DRINK_GRAMS, 1),
                avg_standard_drinks: utils.roundTo((grams / daysBetween / constants.STANDARD_DRINK_GRAMS), 1)
            });
        });
}

function makeSubMenuStatsFunction(days) {
    return (context, user, msg, words) => {
        return user.getDrinkSumForXHours(days * 24)
            .then((res) => {
                const sum = res.sum;
                const created = new Date(res.created);
                const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
                const daysBetween = (days) ? parseInt(days) : Math.ceil((new Date().getTime() - created.getTime()) / oneDay);
                const grams = sum / 1000.0;
                return str_tilastoja.kulutus.prefilled.format({
                    day_count: daysBetween,
                    grams: utils.roundTo(grams, 1),
                    standard_drinks: utils.roundTo(grams / constants.STANDARD_DRINK_GRAMS, 1),
                    avg_standard_drinks: utils.roundTo((grams / daysBetween / constants.STANDARD_DRINK_GRAMS), 1)
                });
            });
    };
}

function makeDrinksString(drinks) {
    let list = [];
    let day = null;
    for (var i in drinks) {
        let drink = drinks[i];
        let drinkTime = new Date(Date.parse(drink.created));
        let drinkShortDate = drinkTime.getDate() + '.' + (drinkTime.getMonth() + 1) + '.';
        if (day !== drinkShortDate) {
            day = drinkShortDate;
            list.push(day);
        }
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

module.exports = {
    _userRequired: true,
    _text: str_tilastoja.on_select,
    [str_tilastoja.kulutus.button_text]: {
        _userRequired: true,
        _onSelect: (context, user, msg, words) => {
            return statsForDays(context, user, msg, words);
        },
        _onText: (context, user, msg, words) => {
            const days = (words[0] && parseInt(words[0])) ? parseInt(words[0]) : 4 * 365;
            return statsForDays(context, user, msg, words, days);
        },
        [str_tilastoja.kulutus.days7]: {
            _userRequired: true,
            _onSelect: makeSubMenuStatsFunction(7)
        },
        [str_tilastoja.kulutus.days14]: {
            _userRequired: true,
            _onSelect: makeSubMenuStatsFunction(14)
        },
        [str_tilastoja.kulutus.days30]: {
            _userRequired: true,
            _onSelect: makeSubMenuStatsFunction(30)
        },
        [str_tilastoja.kulutus.days60]: {
            _userRequired: true,
            _onSelect: makeSubMenuStatsFunction(60)
        }
    },
    [str_tilastoja.otinko.button_text]: {
        _userRequired: true,
        _onSelect: (context, user, msg, words) => {
            return user.getBoozeForLastHours(72)
                .then((drinkList72h) => {
                    return str_tilastoja.otinko.on_select.format({
                        drink_list: makeDrinksString(drinkList72h)
                    });
                });
        },
    }
};