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
    users.js
    unit tests for users.js functions
*/

/* globals describe, it, beforeEach */

'use strict';

const assert = require('assert');
const blakkistest = require('../blakkistest.js');
const stats = require('../../app/db/stats.js');
const query = require('pg-query');
query.connectionParameters = process.env.DATABASE_URL;


describe('stats.js', function() {
    beforeEach(blakkistest.resetDbWithTestUsersAndGroupsAndDrinks);

    describe('stats.getGlobalStats()', function() {
        it('should return an object with 7 fields', function(done) {
            stats.getGlobalStats()
                .then((res) => {
                    assert.equal(res.usersCount, 10);
                    assert.notEqual(res.activeUsers14DaysCount, undefined);
                    assert.notEqual(res.activeUsers7DaysCount, undefined);
                    assert.notEqual(res.activeGroups14DaysCount, undefined);
                    assert.notEqual(res.activeGroups7DaysCount, undefined);
                    assert.equal(res.groupsCount, 1);
                    assert.notEqual(res.top10UserStats, undefined);
                    done();
                }).catch((err) => {
                    done(new Error(err));
                });
        });

        it('should count active users and groups correctly and list top10 in correct order', function(done) {
            stats.getGlobalStats()
                .then((res) => {
                    assert.equal(res.usersCount, 10);
                    assert.equal(res.activeUsers14DaysCount, 2);
                    assert.equal(res.activeUsers7DaysCount, 2);
                    assert.equal(res.activeGroups14DaysCount, 1);
                    assert.equal(res.activeGroups7DaysCount, 1);
                    assert.equal(res.top10UserStats.length, 2);
                    assert.equal(res.top10UserStats[0].userid, blakkistest.users[0].userId);
                    assert.equal(res.top10UserStats[1].userid, blakkistest.users[1].userId);
                    done();
                }).catch((err) => {
                    done(err);
                });
        });
    });

    describe('stats.getGroupStats()', function() {
        it('should return an object with 2 fields', function(done) {
            stats.getGroupStats(blakkistest.groups[0].group, 24)
                .then((res) => {
                    assert.notEqual(res.top10UserStats, undefined);
                    assert.notEqual(res.groupDrinkSum, undefined);
                    done();
                }).catch((err) => {
                    done(new Error(err));
                });
        });

        it('should list top10 in correct order and sum alcohol correctly', function(done) {
            stats.getGroupStats(blakkistest.groups[0].group, 100)
                .then((res) => {
                    assert.equal(res.top10UserStats.length, 2);
                    assert.equal(res.top10UserStats[0].userid, blakkistest.users[0].userId);
                    assert.equal(res.top10UserStats[1].userid, blakkistest.users[1].userId);
                    assert.equal(res.top10UserStats[1].userid, blakkistest.users[1].userId);
                    assert.equal(res.groupDrinkSum.sum, 12347 * 3);
                    done();
                }).catch((err) => {
                    done(err);
                });
        });
    });
});