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
const stats = require('../../app/db/stats.js');
const utils = require('../../app/lib/utils.js');
const query = require('pg-query');
const when = require('when');
query.connectionParameters = process.env.DATABASE_URL;

let testUsers = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}]; // 10 users
testUsers = testUsers.map((user, i) => {
    user.userid = i + '';
    user.username = utils.encrypt(i + '');
    user.weight = 80 + i;
    user.height = 180 + i;
    user.gender = 'mies';
    user.read_terms = true;
    user.read_announcements = 1;
    return user;
});

let testGroups = [{
    id: utils.hashSha256('1'),
    users: testUsers.map(user => user.userid)
}];

let userInsertValuesStr = testUsers.map(user => {
    return `('${user.userid}', '${user.username}', ${user.weight}, '${user.gender}', ${user.height}, ${user.read_terms}, ${user.read_announcements})`;
});
let userInGroupsValuesStr = testGroups.map(group => {
    return group.users.map(userid => `('${group.id}', '${userid}')`).join(', ');
});

describe('stats.js', function() {
    beforeEach(function(done) {
        when.all([
            query('delete from users'),
            query('delete from users_drinks'),
            query('delete from users_in_groups')
        ]).spread(() => {
            when.all([
                    query('insert into users (userid, nick, weight, gender, height, read_terms, read_announcements) values ' + userInsertValuesStr.join(', ')),
                    query('insert into users_in_groups (groupid, userid) values ' + userInGroupsValuesStr.join(', '))
                ])
                .spread(() => done()).catch((err) => done(new Error(err)));
        }, (err) => {
            done(new Error(err));
        });
    });

    describe('stats.getGlobalStats()', function() {
        it('should return an object with 7 fields', function(done) {
            stats.getGlobalStats()
                .then((res) => {
                    try {
                        assert.equal(res.usersCount, 10);
                        assert.notEqual(res.activeUsers14DaysCount, undefined);
                        assert.notEqual(res.activeUsers7DaysCount, undefined);
                        assert.notEqual(res.activeGroups14DaysCount, undefined);
                        assert.notEqual(res.activeGroups7DaysCount, undefined);
                        assert.equal(res.groupsCount, 1);
                        assert.notEqual(res.top10UserStats, undefined);
                        done();
                    } catch (err) {
                        done(err);
                    }
                }, (err) => {
                    done(new Error(err));
                });
        });

        it('should count active users and groups correctly and list top10 in correct order', function(done) {
            query(`insert into users_drinks (userId, alcohol, description) values (${testUsers[0].userid}, 12347, 'kalja'), (${testUsers[0].userid}, 12347, 'kalja'), (${testUsers[1].userid}, 12347, 'kalja')`)
                .then(() => {
                    stats.getGlobalStats()
                        .then((res) => {
                            try {
                                assert.equal(res.usersCount, 10);
                                assert.equal(res.activeUsers14DaysCount, 2);
                                assert.equal(res.activeUsers7DaysCount, 2);
                                assert.equal(res.activeGroups14DaysCount, 1);
                                assert.equal(res.activeGroups7DaysCount, 1);
                                assert.equal(res.top10UserStats.length, 2);
                                assert.equal(res.top10UserStats[0].userid, testUsers[0].userid);
                                assert.equal(res.top10UserStats[1].userid, testUsers[1].userid);
                                done();
                            } catch (err) {
                                done(err);
                            }
                        }, (err) => {
                            done(err);
                        });
                }, (err) => {
                    done(err);
                });
        });
    });

    describe('stats.getGroupStats()', function() {
        it('should return an object with 2 fields', function(done) {
            stats.getGroupStats('1', 24)
                .then((res) => {
                    try {
                        assert.notEqual(res.top10UserStats, undefined);
                        assert.notEqual(res.groupDrinkSum, undefined);
                        done();
                    } catch (err) {
                        done(err);
                    }
                }, (err) => {
                    done(new Error(err));
                });
        });

        it('should list top10 in correct order and sum alcohol correctly', function(done) {
            query(`insert into users_drinks (userId, alcohol, description) values (${testUsers[0].userid}, 12347, 'kalja'), (${testUsers[0].userid}, 12347, 'kalja'), (${testUsers[1].userid}, 12347, 'kalja')`)
                .then(() => {
                    stats.getGroupStats('1', 100)
                        .then((res) => {
                            try {
                                assert.equal(res.top10UserStats.length, 2);
                                assert.equal(res.top10UserStats[0].userid, testUsers[0].userid);
                                assert.equal(res.top10UserStats[1].userid, testUsers[1].userid);
                                assert.equal(res.top10UserStats[1].userid, testUsers[1].userid);
                                assert.equal(res.groupDrinkSum.sum, 12347*3);
                                done();
                            } catch (err) {
                                done(err);
                            }
                        }, (err) => {
                            done(err);
                        });
                }, (err) => {
                    done(err);
                });
        });
    });
});