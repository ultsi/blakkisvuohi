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
    alcomath.js
    Alcohol related math wizardry.
*/

'use strict';

const constants = require('../constants.js');
let alcomath = module.exports = {};

alcomath.getPermillesFromGrams = function(user, grams) {
    let standard_drinks = grams / constants.STANDARD_DRINK_GRAMS;
    return (constants.MEAN_BODY_WATER * (standard_drinks)) / (constants.LIQUID_PERCENT[user.gender] * user.weight) * 10;
};

alcomath.getPermillesFromGramsByHour = function(user, gramsByHour) {
    var permillesByHour = [];
    for (var i in gramsByHour) {
        let standard_drinks = gramsByHour[i].grams / constants.STANDARD_DRINK_GRAMS;
        permillesByHour[i] = {
            permilles: (constants.MEAN_BODY_WATER * (standard_drinks)) / (constants.LIQUID_PERCENT[user.gender] * user.weight) * 10,
            hour: gramsByHour[i].hour
        };
    }
    return permillesByHour;
};

alcomath.sumGrams = function(drinks) {
    let milligrams = 0;
    for (var i in drinks) {
        let drink = drinks[i];
        milligrams += drink.alcohol;
    }
    return milligrams / 1000.0;
};

alcomath.getUserBurnRate = function(user) {
    return user.weight / 9.0;
};

alcomath.sumGramsUnBurned = function(user, drinks) {
    let milligrams = 0;
    let now = Date.now();
    let lastTime = null;
    let hourInMillis = 3600 * 1000;
    let userBurnRateMilligrams = alcomath.getUserBurnRate(user) * 1000;
    for (var i in drinks) {
        let drink = drinks[i];
        let drinkTime = Date.parse(drink.created);
        if (lastTime) {
            let diff = drinkTime - lastTime;
            let diffInHours = diff / hourInMillis;
            milligrams -= (userBurnRateMilligrams * diffInHours);
            milligrams = milligrams > 0 ? milligrams : 0;
        }
        milligrams += drink.alcohol;
        lastTime = drinkTime;
    }
    let diff = now - lastTime;
    let diffInHours = diff / hourInMillis;
    milligrams -= userBurnRateMilligrams * diffInHours;
    milligrams = milligrams > 0 ? milligrams : 0;
    return milligrams / 1000.0;
};

alcomath.sumGramsUnBurnedByHour = function(user, drinks) {
    let milligrams = 0;
    let hourInMillis = 3600 * 1000;
    let now = Date.now();
    let yesterday = now - hourInMillis * 24;
    let lastTime = null;
    let userBurnRateMilligrams = alcomath.getUserBurnRate(user) * 1000;
    let gramsByHour = [];
    for (var i = 0; i < 25; i += 1) {
        var time = new Date(yesterday + hourInMillis * i);
        gramsByHour[i] = {
            grams: 0,
            hour: time.getHours(),
            time: time
        };
    }

    let lastFilledHour = 0;

    for (var d in drinks) {
        let drink = drinks[d];
        let drinkTime = Date.parse(drink.created);
        if (lastTime) {
            let diff = drinkTime - lastTime;
            let diffInHours = diff / hourInMillis;
            milligrams -= (userBurnRateMilligrams * diffInHours);
            milligrams = milligrams > 0 ? milligrams : 0;
        }
        milligrams += drink.alcohol;
        lastTime = drinkTime;

        for (var h = lastFilledHour; h < 25; h += 1) {
            var hourDetails = gramsByHour[h];
            if (drinkTime < hourDetails.time.getTime()) {
                lastFilledHour = h;
                break;
            }
            var _diffInHours = (drinkTime - hourDetails.time.getTime()) / hourInMillis;
            var _milligrams = milligrams - (userBurnRateMilligrams * _diffInHours);
            _milligrams = _milligrams > 0 ? _milligrams : 0;
            gramsByHour[h].grams = _milligrams / 1000.0;
        }

    }


    for (var ho = lastFilledHour; ho < 25; ho += 1) {
        var hourDetailsLast = gramsByHour[ho];
        if (now < hourDetailsLast.time.getTime()) {
            lastFilledHour = ho;
            break;
        }
        milligrams = milligrams - (userBurnRateMilligrams);
        milligrams = milligrams > 0 ? milligrams : 0;
        gramsByHour[ho].grams = milligrams / 1000.0;
    }

    return gramsByHour;
};

alcomath.getPermillesFromDrinks = function(user, drinks) {
    return alcomath.getPermillesFromGrams(user, alcomath.sumGramsUnBurned(user, drinks));
};

alcomath.getPermillesAndGramsFromDrinksByHour = function(user, drinks) {
    var gramsByHour = alcomath.sumGramsUnBurnedByHour(user, drinks);
    return {
        permillesByHour: alcomath.getPermillesFromGramsByHour(user, gramsByHour),
        gramsByHour: gramsByHour
    };
};