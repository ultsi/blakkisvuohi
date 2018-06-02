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
const utils = require('../lib/utils.js');
let alcomath = module.exports = {};

/*  Variation of the Widmark equation used from the Original article "The Estimation of Blood Alcohol Concentration"
    DOI: 10.1385/Forensic Sci. Med. Pathol.:3:1:33

    Most BAC calculations are based on the Widmark formula,

        C = A/(rW) - (βt)

    where C is the blood alcohol concentration; A is the mass of
    alcohol consumed; r is the Widmark factor; W is body weight;
    t is elapsed time since the start of drinking; and β is the elim-
    ination rate.

    In addition, take alcohol absorption into account:

    BAC = (A[ingested]*(1 – e^(−t*ln(2)/t[1_2])) − (βt[n]))/(r*W)

    where t[1_2] is the time constant for absorption half life (0.1066 for empty stomach)

    The total observed BAC is the sum of the BACs for each
    individual drink.

    BAC[total] = sum(0->n)BAC[n] - (βt[n])

    where BAC[n] is the same equation as BAC above, but elimination rate is excluded

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

/*
    Seidl et al. (8) gathered height (in centimeters), weight
    (in kilograms), blood water content, and TBW data for 256
    women and 273 men and used the data to fine tune the Widmark
    equation according to the formulae

    r(female) = 0.31223 – 0.006446W + 0.4466H
    r(male) = 0.31608 – 0.004821W + 0.4632H
*/
alcomath.getWidmarkFactorForUser = (user) => {
    const H = user.height;
    const W = user.weight;
    return user.gender === 'mies' ?
        0.31608 - 0.004821 * W + 0.4632 * H :
        0.31223 - 0.006446 * W + 0.4466 * H;
};

// TODO: maybe mean+-0.01 based on drinking habits
alcomath.getUserMetabolismRate = function() {
    return constants.METABOLISM_RATE; // mean MR is usually between 0.15-0.20
};


/*
    Alcohol absorbed = (A[ingested]*(1 – e^(−t * ln(2)/t[1_2])))/(r*W)
*/
const MAGIC_NUMBER = 6.9; // found by trial and error when comparing to multiple measurements

alcomath.estimateAbsorbedAlcoholConcentration = (user, milligrams, drinking_period) => {
    const grams = milligrams / 1000;
    const A = grams / MAGIC_NUMBER;
    const r = alcomath.getWidmarkFactorForUser(user);
    const half_t = 0.1066; // half life of absorption
    const t = drinking_period;
    const W = user.weight;

    const eaac = ((A * (1 - Math.exp(-t * Math.log(2) / half_t))) / (r * W)) * 1000; // * 1000 convert to permilles

    return eaac > 0 ? eaac : 0;
};

alcomath.estimateUnburnedAlcohol = (user, ebac) => {
    const r = alcomath.getWidmarkFactorForUser(user);
    const half_t = 0.1066; // half life of absorption
    const t = 0.5;
    const W = user.weight;

    const A = ((ebac / 1000) * (r * W)) / (1 - Math.exp(-t * Math.log(2) / half_t)) * MAGIC_NUMBER;

    return A > 0 ? A : 0;
};

alcomath.calculateEBACFromDrinks = (user, drinks) => {
    const now = Date.now();
    const in30Mins = now + constants.HOUR_IN_MILLIS * 0.5;
    const MR = alcomath.getUserMetabolismRate(user);

    if (!drinks || drinks.length === 0) {
        return {
            permilles: 0,
            permilles30Min: 0,
            grams: 0,
            burn_hours: 0
        };
    }

    let absorbedAlcoholConcentration = 0;
    let absorbedAlcoholConcentrationIn30 = 0;
    let startTime = Date.parse(drinks[0].created);
    for (let i in drinks) {
        const drink = drinks[i];
        const drinkTime = Date.parse(drink.created);
        const burn_time = (drinkTime - startTime) / constants.HOUR_IN_MILLIS;
        const ebac = absorbedAlcoholConcentration - MR * burn_time;
        if (ebac <= 0) {
            absorbedAlcoholConcentration = 0;
            absorbedAlcoholConcentrationIn30 = 0;
            startTime = drinkTime;
        }
        let absorption_time = (now - drinkTime) / constants.HOUR_IN_MILLIS;
        let absorption_time30 = (in30Mins - drinkTime) / constants.HOUR_IN_MILLIS;
        absorbedAlcoholConcentration += alcomath.estimateAbsorbedAlcoholConcentration(user, drink.alcohol, absorption_time);
        absorbedAlcoholConcentrationIn30 += alcomath.estimateAbsorbedAlcoholConcentration(user, drink.alcohol, absorption_time30);
    }

    const permilles = Math.max(absorbedAlcoholConcentration - MR * Math.max((now - startTime) / constants.HOUR_IN_MILLIS, 0), 0);
    const permilles30Min = Math.max(absorbedAlcoholConcentrationIn30 - MR * Math.max((in30Mins - startTime) / constants.HOUR_IN_MILLIS, 0), 0);
    let burn_hours = permilles30Min / alcomath.getUserMetabolismRate(user);
    burn_hours = burn_hours > 0 ? burn_hours + 0.5 : burn_hours;

    return {
        permilles: permilles,
        permilles30Min: permilles30Min,
        grams: alcomath.estimateUnburnedAlcohol(user, permilles),
        burn_hours: burn_hours
    };
};

alcomath.calculateEBACByHourFromDrinks = (user, drinks, lastNHours, predictNHours) => {
    const now = Date.now();
    const startTime = (now - constants.HOUR_IN_MILLIS * lastNHours) - now % constants.HOUR_IN_MILLIS; // floor to hours
    const MR = alcomath.getUserMetabolismRate(user);

    let permillesByHour = [];
    for (let i = 0; i < lastNHours + predictNHours + 1; i += 1) {
        let time = new Date(startTime + constants.HOUR_IN_MILLIS * i);
        let absorbedAlcoholConcentration = 0;
        let absorptionStartTime = Date.parse(drinks[0].created);
        for (let d in drinks) {
            const drink = drinks[d];
            const drinkTime = Date.parse(drink.created);
            const burn_time = (drinkTime - absorptionStartTime) / constants.HOUR_IN_MILLIS;
            if (time - drinkTime > 0) {
                const ebac = absorbedAlcoholConcentration - MR * burn_time;
                if (ebac <= 0) {
                    absorbedAlcoholConcentration = 0;
                    absorptionStartTime = drinkTime;
                }
                let absorption_time = (time - drinkTime) / constants.HOUR_IN_MILLIS;
                absorbedAlcoholConcentration += alcomath.estimateAbsorbedAlcoholConcentration(user, drink.alcohol, absorption_time);
            }
        }
        const permilles = Math.max(absorbedAlcoholConcentration - MR * Math.max((time - absorptionStartTime) / constants.HOUR_IN_MILLIS, 0), 0);
        permillesByHour[i] = {
            permilles: permilles,
            hour: time.getHours(),
            time: time
        };
    }

    return permillesByHour;
};

alcomath.toStandardDrinks = (alcohol_grams, decimals) => {
    decimals = decimals || 1;
    return utils.roundTo(alcohol_grams / constants.STANDARD_DRINK_GRAMS, decimals);
};

alcomath.isAlcoholAmountOutOfLimits = (mg) => {
    return mg > constants.SINGLE_DRINK_ALCOHOL_LIMIT;
};