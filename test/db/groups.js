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
    groups.js
    unit tests for groups.js functions
*/

/* globals describe, it, beforeEach */

'use strict';

const blakkistest = require('../blakkistest.js');
const assert = require('assert');
const groups = require('../../app/db/groups.js');
const utils = require('../../app/lib/utils.js');
const query = require('pg-query');
query.connectionParameters = process.env.DATABASE_URL;

describe('groups.js', function() {
    beforeEach(blakkistest.resetDbWithTestUsersAndGroupsAndDrinks);

    describe('groups.Group()', function() {
        it('should return a group object with hashed group id', function() {
            const group = new groups.Group(0);
            assert.equal(group.groupId, utils.hashSha256(0));
        });
    });

    describe('Group.getDrinkSum()', function() {
        it('should return sum of drinks for group and min(created) Date', function(done) {
            const group = blakkistest.groups[0].group;
            group.getDrinkSum()
                .then((res) => {
                    try {
                        assert.equal(res.sum, 12347 * 3);
                        assert(res.created instanceof Date);
                    } catch (err) {
                        done(err);
                        return Promise.reject(err);
                    }
                    done();
                })
                .catch((err) => done(err));
        });

        it('should return sum 0 for non-existing group  and min(created) Date', function(done) {
            const group = new groups.Group(100);
            group.getDrinkSum()
                .then((res) => {
                    try {
                        assert.equal(res.sum, 0);
                        assert(res.created instanceof Date);
                    } catch (err) {
                        done(err);
                        return Promise.reject(err);
                    }
                    done();
                })
                .catch((err) => done(err));
        });
    });

    describe('Group.getDrinkSumForXHours()', function() {
        it('should return different sum of drinks and dates for different hours', function(done) {
            const group = blakkistest.groups[0].group;
            const user = blakkistest.users[0];
            group.getDrinkSumForXHours(24)
                .then((res) => {
                    try {
                        assert.equal(res.sum, 12347 * 3);
                        assert(res.created instanceof Date);
                    } catch (err) {
                        done(err);
                        return Promise.reject(err);
                    }
                    // insert drink 3 hours into the past
                    return user.drinkBoozeLate([{
                        mg: 12347,
                        text: 'kalja'
                    }], 2);
                })
                .then(() => group.getDrinkSumForXHours(24))
                .then((res) => {
                    try {
                        assert.equal(res.sum, 12347 * 4);
                        assert(res.created instanceof Date);
                    } catch (err) {
                        done(err);
                        return Promise.reject(err);
                    }
                    return group.getDrinkSumForXHours(2);
                })
                .then((res) => {
                    try {
                        assert.equal(res.sum, 12347 * 3);
                        assert(res.created instanceof Date);
                    } catch (err) {
                        return done(err);
                    }
                    done();
                })
                .catch((err) => done(err));
        });

        it('should return sum 0 for non-existing group  and min(created) Date', function(done) {
            const group = new groups.Group(100);
            group.getDrinkSum()
                .then((res) => {
                    try {
                        assert.equal(res.sum, 0);
                        assert(res.created instanceof Date);
                    } catch (err) {
                        done(err);
                        return Promise.reject(err);
                    }
                    done();
                })
                .catch((err) => done(err));
        });
    });

    describe('Group.getDrinkSumsByUser()', function() {
        it('should return sums grouped by user', function(done) {
            const group = blakkistest.groups[0].group;
            group.getDrinkSumsByUser()
                .then((rows) => {
                    try {
                        const user0 = rows[blakkistest.users[0].userId];
                        assert.equal(user0.sum, 12347*2);
                        const user1 = rows[blakkistest.users[1].userId];
                        assert.equal(user1.sum, 12347);
                    } catch (err) {
                        done(err);
                        return Promise.reject(err);
                    }
                    done();
                })
                .catch((err) => done(err));
        });
    });

    describe('Group.getDrinkTimesByUser()', function() {
        it('should return group\'s users\' drinks for a group', function(done) {
            const group = blakkistest.groups[0].group;
            group.getDrinkTimesByUser()
                .then((drinksByUser) => {
                    try {
                        const user0 = drinksByUser[blakkistest.users[0].userId];
                        assert.equal(user0.drinks.length, 2);
                        const user1 = drinksByUser[blakkistest.users[1].userId];
                        assert.equal(user1.drinks.length, 1);
                    } catch (err) {
                        done(err);
                        return Promise.reject(err);
                    }
                    done();
                })
                .catch((err) => done(err));
        });
    });

    describe('Group.getPermillesListing()', function() {
        it('should return group\'s permilles listing', function(done) {
            const group = blakkistest.groups[0].group;
            group.getPermillesListing()
                .then((permillesSorted) => {
                    try {
                        assert.equal(permillesSorted[0][0], blakkistest.users[0].username);
                        assert.equal(permillesSorted[1][0], blakkistest.users[1].username);
                        assert(permillesSorted[0][1] > permillesSorted[1][1]);
                    } catch (err) {
                        done(err);
                        return Promise.reject(err);
                    }
                    done();
                })
                .catch((err) => done(err));
        });
    });

    // TODO FIX SD LISTING
    describe('Group.getStandardDrinksListing()', function() {
        it('should return group\'s standard drink listing', function(done) {
            const group = blakkistest.groups[0].group;
            group.getStandardDrinksListing()
                .then((standardDrinksSorted) => {
                    try {
                        assert.equal(standardDrinksSorted[0][0], blakkistest.users[0].username);
                        assert.equal(standardDrinksSorted[1][0], blakkistest.users[1].username);
                        assert(standardDrinksSorted[0][1] > standardDrinksSorted[1][1]);
                    } catch (err) {
                        done(err);
                        return Promise.reject(err);
                    }
                    done();
                })
                .catch((err) => done(err));
        });
    });
});