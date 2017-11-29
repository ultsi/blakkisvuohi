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

'use strict';

let alcomath = {};

const ETANOL_GRAMS_PER_LITRE = 789;
const LIQUID_PERCENT = {mies: 0.58, nainen: 0.53};
const MEAN_BODY_WATER = 0.806;

alcomath.calcAlcoholMilliGrams = function(vol_perc, amount) {
    return Math.round(vol_perc * ETANOL_GRAMS_PER_LITRE * amount * 1000);
};

alcomath.KALJA033 = alcomath.calcAlcoholMilliGrams(0.047, 0.33);
alcomath.NELONEN = alcomath.calcAlcoholMilliGrams(0.055, 0.33);
alcomath.KALJA05 = alcomath.calcAlcoholMilliGrams(0.047, 0.50);
alcomath.SHOTTI40 = alcomath.calcAlcoholMilliGrams(0.4, 0.04);
alcomath.STANDARD_DRINK_GRAMS = 10.6;

alcomath.LIMITS = {
    6.0: 'Hyvin todennäköinen kuolema (alkoholimyrkytys)',
    5.0: 'Todennäköinen kuolema (alkoholimyrkytys)',
    4.0: 'Keskimääräinen alkoholimyrkytys (18v)',
    3.5: 'Sammuminen, mahdollinen alkoholimyrkytys',
    3.25: 'Normaali ihminen ei kykene kävelemään',
    3.0: 'Muisti menee',
    2.5: 'Hoipertelua',
    2.25: 'Tanssiminen ja liikkuminen vaikeaa',
    2.0: 'Puhe sammaltaa, kivun tunne katoaa, tajunta heikkenee',
    1.82: 'Omatoimikapteeniutta saattaa esiintyä',
    1.5: 'Voimakasta estottomuutta, tunteellisuutta',
    1.25: 'Törkeä rattijuopumus',
    1.0: 'Aggressiot lisääntyvät, innostuneisuutta, kömpelyyttä',
    0.75: 'Hyväntuulisuutta, estot poistuvat',
    0.5: 'Rattijuopumus',
    0.25: 'Impulsiivisuutta, hyvän olon tunne'
};

alcomath.getPermillesFromGrams = function(user, grams) {
    let standard_drinks = grams / alcomath.STANDARD_DRINK_GRAMS;
    return (MEAN_BODY_WATER * (standard_drinks)) / (LIQUID_PERCENT[user.gender] * user.weight) * 10;
};

alcomath.getPermillesFromGramsByHour = function(user, gramsByHour) {
    var permillesByHour = [];
    for(var i in gramsByHour){
        let standard_drinks = gramsByHour[i].grams / alcomath.STANDARD_DRINK_GRAMS;
        permillesByHour[i] = {permilles: (MEAN_BODY_WATER * (standard_drinks)) / (LIQUID_PERCENT[user.gender] * user.weight) * 10, hour: gramsByHour[i].hour};
    }
    return permillesByHour;
};

alcomath.sumGrams = function(drinks) {
    let milligrams = 0;
    for(var i in drinks) {
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
    for(var i in drinks) {
        let drink = drinks[i];
        let drinkTime = Date.parse(drink.created);
        if(lastTime) {
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
    let nowDate = new Date(now);
    let yesterday = now - hourInMillis * 24;
    let yesterdayDate = new Date(yesterday);
    let lastTime = null;
    let userBurnRateMilligrams = alcomath.getUserBurnRate(user) * 1000;
    let gramsByHour = [];
    for(var i=0; i<25; i+=1){
        var time = new Date(yesterday + hourInMillis * i);
        gramsByHour[i] = {grams: 0, hour: (time.getHours()+3)%24, time: time};
    }

    let lastFilledHour = 0;

    for(var d in drinks) {
        let drink = drinks[d];
        let drinkTime = Date.parse(drink.created);
        if(lastTime) {
            let diff = drinkTime - lastTime;
            let diffInHours = diff / hourInMillis;
            milligrams -= (userBurnRateMilligrams * diffInHours);
            milligrams = milligrams > 0 ? milligrams : 0;
        }
        milligrams += drink.alcohol;
        lastTime = drinkTime;

        for(var h=lastFilledHour; h < 25; h+=1){
            var hourDetails = gramsByHour[h];
            if(drinkTime < hourDetails.time.getTime()){
                lastFilledHour = h;
                break;
            }
            var _diffInHours = (drinkTime - hourDetails.time.getTime()) / hourInMillis;
            var _milligrams = milligrams - (userBurnRateMilligrams * _diffInHours);
            _milligrams = _milligrams > 0 ? _milligrams : 0;
            gramsByHour[h].grams = _milligrams / 1000.0;
        }

    }


    for(var ho=lastFilledHour; ho < 25; ho+=1){
        var hourDetailsLast = gramsByHour[ho];
        if(now < hourDetailsLast.time.getTime()){
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
    return {permillesByHour: alcomath.getPermillesFromGramsByHour(user,gramsByHour), gramsByHour: gramsByHour};
};

module.exports = alcomath;