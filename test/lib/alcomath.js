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
    alcomath.js
    unit tests for alcomath.js functions
*/

/* globals describe, it */

'use strict'

const assert = require('assert')
import * as alcomath from '../../src/lib/alcomath'
import * as constants from '../../src/constants'

const testUsers = {
    male: {
        id: 'id1',
        username: 'testMale',
        gender: 'mies',
        height: 190,
        weight: 90
    },
    female: {
        id: 'id2',
        username: 'testFemale',
        gender: 'nainen',
        height: 190,
        weight: 90
    },
}
const now = new Date()

const drinks = {
    now: [{
        created: now.toString(),
        alcohol: 12379 // 0.33l 4.7%
    }],
    halfHourAgo: [{
        created: new Date(now.getTime() - 3600 * 1000),
        alcohol: 12379 // 0.33l 4.7%
    }],
    dayAgo: [{
        created: new Date(now.getTime() - 24 * 3600 * 1000),
        alcohol: 12379 // 0.33l 4.7%
    }],
}

describe('alcomath.js', function() {
    describe('getWidmarkFactorForUser()', function() {
        it('should return different factors for male and female users', function() {
            const maleFactor = alcomath.getWidmarkFactorForUser(testUsers.male)
            const femaleFactor = alcomath.getWidmarkFactorForUser(testUsers.female)
            assert(maleFactor !== femaleFactor)
        })

        it('should return different factor for different height users', function() {
            const other = Object.assign({}, testUsers.male)
            other.height = other.height - 10
            const maleFactor = alcomath.getWidmarkFactorForUser(testUsers.male)
            const otherFactor = alcomath.getWidmarkFactorForUser(other)
            assert(maleFactor !== otherFactor)
        })

        it('should return different factor for different weight users', function() {
            const other = Object.assign({}, testUsers.male)
            other.weight = other.weight - 10
            const maleFactor = alcomath.getWidmarkFactorForUser(testUsers.male)
            const otherFactor = alcomath.getWidmarkFactorForUser(other)
            assert(maleFactor !== otherFactor)
        })
    })

    describe('getUserMetabolismRate()', function() {
        it('should return ' + constants.METABOLISM_RATE, function() {
            assert(alcomath.getUserMetabolismRate() === constants.METABOLISM_RATE)
        })
    })

    describe('estimateAbsorbedAlcoholConcentration', function() {
        it('should return 0 for 1 standard drink at t=0', function() {
            const milligrams = constants.STANDARD_DRINK_GRAMS * 1000
            const hours = 0

            assert.equal(alcomath.estimateAbsorbedAlcoholConcentration(testUsers.male, milligrams, hours), 0)
        })

        it('should return correct absorption rate, x < y < z at t=0, t=0.25, t=0.5 for 1 standard drink', function() {
            const milligrams = constants.STANDARD_DRINK_GRAMS * 1000
            const x = alcomath.estimateAbsorbedAlcoholConcentration(testUsers.male, milligrams, 0)
            const y = alcomath.estimateAbsorbedAlcoholConcentration(testUsers.male, milligrams, 0.25)
            const z = alcomath.estimateAbsorbedAlcoholConcentration(testUsers.male, milligrams, 0.5)
            const final = alcomath.estimateAbsorbedAlcoholConcentration(testUsers.male, milligrams, 24)

            assert(x < y)
            assert(y < z)
            assert(z < final)
        })
    })

    describe('estimateUnburnedAlcohol', function() {
        it('should return >0 for 0.5 permilles at t=0', function() {
            const hours = 0
            const ebac = 0.5

            assert(alcomath.estimateUnburnedAlcohol(testUsers.male, ebac, hours) > 0)
        })
    })

    describe('calculateEBACFromDrinks', function() {
        it('should return <0.01 permilles for drink.now', function() {
            const ebac = alcomath.calculateEBACFromDrinks(testUsers.male, drinks.now)
            assert(ebac.permilles < 0.01)
        })

        it('should return permilles30Min > permilles for drink.now', function() {
            const ebac = alcomath.calculateEBACFromDrinks(testUsers.male, drinks.now)
            assert(ebac.permilles < ebac.permilles30Min)
        })

        it('should return permilles30Min < permilles for drink.halfHourAgo', function() {
            const ebac = alcomath.calculateEBACFromDrinks(testUsers.male, drinks.halfHourAgo)
            assert(ebac.permilles > ebac.permilles30Min)
        })

        it('should return ebac=0 for drink.dayAgo', function() {
            const ebac = alcomath.calculateEBACFromDrinks(testUsers.male, drinks.dayAgo)
            assert.equal(ebac.permilles, 0)
            assert.equal(ebac.permilles30Min, 0)
            assert.equal(ebac.grams, 0)
        })

        it('should return higher EBAC for females than males for drink.halfHourAgo', function() {
            const ebacMale = alcomath.calculateEBACFromDrinks(testUsers.male, drinks.halfHourAgo)
            const ebacFemale = alcomath.calculateEBACFromDrinks(testUsers.female, drinks.halfHourAgo)
            assert(ebacFemale.permilles > ebacMale.permilles)
        })

        it('should 0 with empty drinks array', function() {
            const ebac = alcomath.calculateEBACFromDrinks(testUsers.male, [])
            assert.equal(ebac.permilles, 0)
            assert.equal(ebac.permilles30Min, 0)
            assert.equal(ebac.grams, 0)
        })
    })

    describe('calculateEBACByHourFromDrinks', function() {
        it('should return 1 length array with hours=0', function() {
            const ebacByHour = alcomath.calculateEBACByHourFromDrinks(testUsers.male, drinks.now, 0, 0)
            assert.equal(ebacByHour.length, 1)
        })

        it('should return X+Y+1 length array with lastHours=Y, predictHours=X', function() {
            const X = 24,
                Y = 12
            const ebacByHour = alcomath.calculateEBACByHourFromDrinks(testUsers.male, drinks.now, X, Y)
            assert.equal(ebacByHour.length, X + Y + 1)
        })

        it('should return array with all objects containing keys permilles, hour, time', function() {
            const X = 24,
                Y = 12
            const ebacByHour = alcomath.calculateEBACByHourFromDrinks(testUsers.male, drinks.now, X, Y)
            for (let i in ebacByHour) {
                assert.notEqual(ebacByHour[i].permilles, undefined)
                assert.notEqual(ebacByHour[i].hour, undefined)
                assert.notEqual(ebacByHour[i].time, undefined)
            }
        })

        it('should contain 0 permilles before ingested drink time and >0 after', function() {
            const ebacByHour = alcomath.calculateEBACByHourFromDrinks(testUsers.male, drinks.now, 12, 1)
            for (let i in ebacByHour) {
                if (ebacByHour[i].time.getTime() < Date.parse(drinks.now[0].created)) {
                    assert.equal(ebacByHour[i].permilles, 0)
                } else {
                    assert(ebacByHour[i].permilles > 0)
                }
            }
        })
    })
})