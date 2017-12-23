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

/* Variation of Widmark equation as developed by
    National Highway Traffic Safety Administration, 1994
    (https://academic.oup.com/alcalc/article/40/5/447/188561#1793285)
    (https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2724514/#B15)

    Are the calculations correct? https://doi.org/10.15288/jsa.2002.63.762

    EBAC = ((0.806 * SD * 1.2) / (BW * Wt) - (MR * DP)) * 10

    where,  0.806 is a constant for body water in the blood (mean 80.6%),
            SD is the number of standard drinks (10g ethanol per drink)
            1.2 to convert to Swedish unit of alcohol (alkoholiannos)
            BW is the body water constant (0.58 for males, 0.49 for females)
            Wt is the body weight (kg)
            MR is the metabolism rate (0.015 for males, 0.017 for females)
            DP is the drinking period (hours)

    Example:

    Ethanol grams per litre = 0.789g/cm^3
    Ethanol grams in a serving 

    Pure alcohol mass = volume * (alcohol by volume * volumetric mass density)
    
    where,  volume (litres)
            alcohol by volume = reported vol percentage (for example 4.7%)
            volumetric mass density = 789.24g/l

    Two 0.33l 4.7% beers

    g = 2 * 0.33l * 0.047 * 789.24g/l
    g = 24.48g

    What is the EBAC if 80kg male consumes 2 beers in 1 hour?
    
    SD = 24.48g/10g = 2.45
    BW = 0.58
    Wt = 80kg
    MR = 0.017
    DP = 1
    EBAC = ((0.806 * 2.45 * 1.2) / (0.58 * 80) - (0.015*1)) * 10
         = 0.36 permilles
    
*/

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