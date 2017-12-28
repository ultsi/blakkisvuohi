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

alcomath.getUserMetabolismRate = function(user) {
    return 0.16;
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
const MAGIC_NUMBER = 6.9; // found by trial and error when comparing to multiple measurements

alcomath.estimateAbsorbedAlcoholConcentration = (user, milligrams, drinking_period) => {
    const grams = milligrams / 1000 ;
    const A = grams / MAGIC_NUMBER;
    const r = alcomath.getWidmarkFactorForUser(user);
    const half_t = 0.1066; // half life of absorption
    const t = drinking_period;
    const W = user.weight;

    const eaac = ((A*(1 - Math.exp(-t * Math.log(2)/half_t)))/(r*W)) * 1000; // * 1000 convert to permilles

    return eaac > 0 ? eaac : 0;
};

alcomath.estimateUnburnedAlcohol = (user, ebac) => {
    const r = alcomath.getWidmarkFactorForUser(user);
    const half_t = 0.1066; // half life of absorption
    const t = 1;
    const W = user.weight;

    const A = ((ebac/1000)*(r*W))/(1 - Math.exp(-t * Math.log(2)/half_t)) * MAGIC_NUMBER;

    return A > 0 ? A : 0;
};

alcomath.calculateEBACFromDrinks = (user, drinks) => {
    const now = Date.now();
    const hourInMillis = 3600 * 1000;
    const in30Mins = now + hourInMillis * 0.5;
    const MR = alcomath.getUserMetabolismRate(user);

    let absorbedAlcoholConcentration = 0;
    let absorbedAlcoholConcentrationIn30 = 0;
    let startTime = Date.parse(drinks[0].created);
    for (let i in drinks) {
        const drink = drinks[i];
        const drinkTime = Date.parse(drink.created);
        const burn_time = (drinkTime - startTime)/hourInMillis;
        const ebac = absorbedAlcoholConcentration - MR * burn_time;
        if (ebac <= 0) {
            absorbedAlcoholConcentration = 0;
            absorbedAlcoholConcentrationIn30 = 0;
            startTime = drinkTime;
        }
        let absorption_time = (now - drinkTime) / hourInMillis;
        let absorption_time30 = (in30Mins - drinkTime) / hourInMillis;
        absorbedAlcoholConcentration += alcomath.estimateAbsorbedAlcoholConcentration(user, drink.alcohol, absorption_time);
        absorbedAlcoholConcentrationIn30 += alcomath.estimateAbsorbedAlcoholConcentration(user, drink.alcohol, absorption_time30);
    }

    const permilles = Math.max(absorbedAlcoholConcentration - MR * Math.max((now - startTime)/hourInMillis, 0), 0);
    const permilles30Min = Math.max(absorbedAlcoholConcentrationIn30 - MR * Math.max((in30Mins - startTime)/hourInMillis, 0), 0);

    return {
        permilles: permilles,
        permilles30Min: permilles30Min,
        grams: alcomath.estimateUnburnedAlcohol(user, permilles)
    };
};

alcomath.calculateEBACByHourFromDrinks = (user, drinks, lastNHours, predictNHours) => {
    const now = Date.now();
    const hourInMillis = 3600 * 1000;
    const startTime = (now - hourInMillis * lastNHours) - now%hourInMillis; // floor to hours
    const MR = alcomath.getUserMetabolismRate(user);

    let permillesByHour = [];
    for (let i = 0; i < lastNHours + predictNHours + 1; i += 1) {
        let time = new Date(startTime + hourInMillis * i);
        let absorbedAlcoholConcentration = 0;
        let absorptionStartTime = Date.parse(drinks[0].created);
        for (let i in drinks) {
            const drink = drinks[i];
            const drinkTime = Date.parse(drink.created);
            const burn_time = (drinkTime - absorptionStartTime)/hourInMillis;
            if (time - drinkTime > 0) {
                const ebac = absorbedAlcoholConcentration - MR * burn_time;
                if (ebac <= 0) {
                    absorbedAlcoholConcentration = 0;
                    absorptionStartTime = drinkTime;
                }
                let absorption_time = (time - drinkTime) / hourInMillis;
                absorbedAlcoholConcentration += alcomath.estimateAbsorbedAlcoholConcentration(user, drink.alcohol, absorption_time);
            }
        }
        const permilles = Math.max(absorbedAlcoholConcentration - MR * Math.max((time - absorptionStartTime)/hourInMillis, 0), 0);
        permillesByHour[i] = {
            permilles: permilles,
            hour: time.getHours(),
            time: time
        };
    }

    return permillesByHour;
};