/*
    Bläkkisvuohi, a Telegram bot to help track estimated blood alcohol concentration.
    Copyright (C) 2017  Joonas Ulmanen

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

/*
    export const js
    Commonly used constants
*/

'use strict'

export const ETANOL_GRAMS_PER_LITRE = 789.24
export const MEAN_HEIGHT = {
    mies: 177.9,
    nainen: 167.2,
}
export const HOUR_IN_MILLIS = 3600 * 1000

export const METABOLISM_RATE = 0.17

export function calcAlcoholMilligrams(volPerc, amount) {
    return Math.round(volPerc * ETANOL_GRAMS_PER_LITRE * amount * 1000)
}

export const KALJA033 = calcAlcoholMilligrams(0.047, 0.33)
export const NELONEN = calcAlcoholMilligrams(0.055, 0.33)
export const KALJA05 = calcAlcoholMilligrams(0.047, 0.50)
export const SHOTTI40 = calcAlcoholMilligrams(0.4, 0.04)
export const STANDARD_DRINK_GRAMS = 12.0
export const SINGLE_DRINK_ALCOHOL_LIMIT = calcAlcoholMilligrams(0.14, 0.75) // 14% sparkling wine bottle

export const emoji = {
    beer: '🍺',
    wine: '🍷',
}

export const milds = {
    beercan: {
        print: emoji.beer + ' 33cl 4.7%',
        mg: calcAlcoholMilligrams(0.047, 0.33),
    },
    beer04: {
        print: emoji.beer + ' 40cl 4.7%',
        mg: calcAlcoholMilligrams(0.047, 0.40),
    },
    beer4: {
        print: emoji.beer + ' 33cl 5.5%',
        mg: calcAlcoholMilligrams(0.055, 0.33),
    },
    beer05: {
        print: emoji.beer + ' 50cl 4.7%',
        mg: calcAlcoholMilligrams(0.047, 0.5),
    },
    beerpint: {
        print: emoji.beer + ' 56.8cl 4.7%',
        mg: calcAlcoholMilligrams(0.047, 0.568),
    },
    lonkero: {
        print: 'Lonkero 33cl 5.3%',
        mg: calcAlcoholMilligrams(0.053, 0.33),
    },
    wine12: {
        print: emoji.wine + ' 12cl 12%',
        mg: calcAlcoholMilligrams(0.12, 0.12),
    },
    wine16: {
        print: emoji.wine + ' 16cl 12%',
        mg: calcAlcoholMilligrams(0.12, 0.16),
    },
}

export const booze = {
    mild: {
        print: '20% 4cl',
        mg: calcAlcoholMilligrams(0.2, 0.04),
    },
    medium: {
        print: '32% 4cl',
        mg: calcAlcoholMilligrams(0.32, 0.04),
    },
    basic: {
        print: '40% 4cl',
        mg: calcAlcoholMilligrams(0.4, 0.04),
    },
}

export const LIMITS = {
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
    0.25: 'Impulsiivisuutta, hyvän olon tunne',
}
