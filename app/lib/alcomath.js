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

let alcomath = module.exports = {};

/*  Variation of the Widmark equation used from the Original article "The Estimation of Blood Alcohol Concentration"
    DOI: 10.1385/Forensic Sci. Med. Pathol.:3:1:33

    Most BAC calculations are based on the Widmark formula,

        C = A/(rW) - (βt)

    where C is the blood alcohol concentration; A is the mass of
    alcohol consumed; r is the Widmark factor; W is body weight;
    t is elapsed time since the start of drinking; and β is the elim-
    ination rate.

    Seidl et al. (8) gathered height (in centimeters), weight
    (in kilograms), blood water content, and TBW data for 256
    women and 273 men and used the data to fine tune the Widmark
    equation according to the formulae

    r(female) = 0.31223 – 0.006446W + 0.4466H
    r(male) = 0.31608 – 0.004821W + 0.4632H

    In addition, take alcohol absorption into account:

    BAC[n] = (A[ingested]*(1 – e^(−kt[n])) − (βt[n]))/(r*W)

    where k is the time constant for absorption rate (6.5 hours for full stomach, 2.3 hours for empty stomach)

    The total observed BAC is the sum of the BACs for each
    individual drink.

    BAC[total] = sum(0->n)BAC[n]

    Ethanol grams per litre = 0.789g/cm^3
    Ethanol grams in a serving 
    Pure alcohol mass = volume * (alcohol by volume * volumetric mass density)
     
    where,  volume (litres)
            alcohol by volume = reported vol percentage (for example 4.7%)
            volumetric mass density = 789.24g/l

    20cl of 40% vodka

    g = 0.20l * 0.4 * 789.24g/l
    g = 63.1392g

*/

/*
    Sum the milligrams of drinks over time from 
    first drink's start time to current time
    Calculate EBAC every time, if x<0, set time 
    to start again from the current drink
*/

const MEAN_HEIGHT = {
    mies: 177.9,
    nainen: 167.2
};

alcomath.getMeanHeightForUser = (user) => {
    return MEAN_HEIGHT[user.gender];
};

alcomath.getWidmarkFactorForUser = (user) => {
    const H = alcomath.getMeanHeightForUser(user);
    const W = user.weight;
    return user.gender === 'mies' ? 
        0.31608 - 0.004821*W + 0.4632*H:
        0.31223 - 0.006446*W + 0.4466*H;
};

/*
    BAC = (A[ingested]*(1 – e^(−kt)) − (βt))/(r*W)
    where r
    r(female) = 0.31223 – 0.006446W + 0.4466H
    r(male) = 0.31608 – 0.004821W + 0.4632H



    TODO: use real height instead of mean height
*/
const MAGIC_NUMBER = 7.8; // found by trial and error when comparing to Table 1 Seidl et al. data points in the original article

alcomath.estimateBloodAlcoholConcentration = (user, milligrams, drinking_period) => {
    const grams = milligrams / 1000 ;
    const A = grams / MAGIC_NUMBER;
    const r = alcomath.getWidmarkFactorForUser(user);
    const half_t = 0.1066; // half life of absorption
    const t = drinking_period;
    const W = user.weight;
    const B = 0.017/100; // common metabolism rate

    const ebac = ((A*(1 - Math.exp(-t * Math.log(2)/half_t)))/(r*W) - (B*t)) * 1000; // * 1000 convert to permilles

    return ebac > 0 ? ebac : 0;
};

alcomath.estimateUnburnedAlcohol = (user, ebac, drinking_period) => {
    const MAGIC_NUMBER = 7.93; // found by trial and error when comparing to Table 1 Seidl et al. data points in the original article
    const r = alcomath.getWidmarkFactorForUser(user);
    const half_t = 0.1066; // half life of absorption
    const t = 0.5;
    const W = user.weight;

    const A = ((ebac/1000)*(r*W))/(1 - Math.exp(-t * Math.log(2)/half_t)) * MAGIC_NUMBER;

    return A > 0 ? A : 0;
};

alcomath.calculateEBACFromDrinks = (user, drinks) => {
    const now = Date.now();
    const hourInMillis = 3600 * 1000;
    const in30Mins = now + hourInMillis * 0.5;

    let ebacs = [];
    let ebacs_30min = [];
    let grams = [];
    for (let i in drinks) {
        let drink = drinks[i];
        let drinkTime = Date.parse(drink.created);
        let drinking_period = (now - drinkTime) / hourInMillis;
        let drinking_period30Mins = (in30Mins - drinkTime) / hourInMillis;
        let ebac = alcomath.estimateBloodAlcoholConcentration(user, drink.alcohol, drinking_period);
        let ebac30Mins = alcomath.estimateBloodAlcoholConcentration(user, drink.alcohol, drinking_period30Mins);
        let A = alcomath.estimateUnburnedAlcohol(user, ebac, drinking_period);
        ebacs.push(ebac);
        ebacs_30min.push(ebac30Mins);
        grams.push(A);
    }

    let permilles = ebacs.reduce((x,y) => x+y, 0);
    let permilles30Min = ebacs_30min.reduce((x,y) => x+y, 0);

    return {
        permilles: permilles,
        permilles30Min: permilles30Min,
        grams: grams.reduce((x,y) => x+y, 0)
    };
};

alcomath.sumGrams = function(drinks) {
    let milligrams = 0;
    for (var i in drinks) {
        let drink = drinks[i];
        milligrams += drink.alcohol;
    }
    return milligrams / 1000.0;
};

alcomath.getUserMetabolismRate = function(user) {
    return 0.15;
};

alcomath.calculateEBACByHourFromDrinks = (user, drinks, lastNHours, predictNHours) => {
    const now = Date.now();
    const hourInMillis = 3600 * 1000;
    const yesterday = (now - hourInMillis * lastNHours) - now%hourInMillis; // floor to hours

    let permillesByHour = [];
    for (let i = 0; i < lastNHours + predictNHours + 1; i += 1) {
        let time = new Date(yesterday + hourInMillis * i);
        let ebacs = [];
        for (let i in drinks) {
            let drink = drinks[i];
            let drinkTime = Date.parse(drink.created);
            let drinking_period = (time - drinkTime) / hourInMillis;
            if(drinking_period >= 0) {
                let ebac = alcomath.estimateBloodAlcoholConcentration(user, drink.alcohol, drinking_period);
                ebacs.push(ebac);
            }
        }
        permillesByHour[i] = {
            permilles: ebacs.reduce((x,y) => x+y, 0),
            hour: time.getHours(),
            time: time
        };
        console.log(i, time.toString(), permillesByHour[i].permilles, permillesByHour[i].hour);
    }

    return permillesByHour;
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

alcomath.getPermillesAndGramsFromDrinksByHour = function(user, drinks) {
    var gramsByHour = alcomath.sumGramsUnBurnedByHour(user, drinks);
    return {
        permillesByHour: alcomath.getPermillesFromGramsByHour(user, gramsByHour),
        gramsByHour: gramsByHour
    };
};
