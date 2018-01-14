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

const blakkistest = require('../blakkistest.js');
const assert = require('assert');
const users = require('../../app/db/users.js');
const utils = require('../../app/lib/utils.js');
const query = require('pg-query');
query.connectionParameters = process.env.DATABASE_URL;

describe('users.js', function() {
    beforeEach(blakkistest.resetDbWithTestUsersAndGroupsAndDrinks);

    describe('users.User()', function() {
        it('should return a user object with arguments as values', function() {
            const user = new users.User('id', 'nick', 90, 'mies', 190, true, 1, Date.now());
            assert.equal(user.userId, 'id');
            assert.equal(user.username, 'nick');
            assert.equal(user.weight, 90);
            assert.equal(user.gender, 'mies');
            assert.equal(user.height, 190);
            assert.equal(user.read_terms, true);
            assert.equal(user.read_announcements, 1);
            assert(user.created.getTime() <= Date.now());
        });
    });

    describe('users.new()', function() {
        it('should insert a user to database and return a user object', function(done) {
            users.new('1', 'nick', 90, 'mies', 190, true, 1, Date.now())
                .then((user) => {
                    try {
                        assert.equal(user.username, 'nick');
                    } catch (err) {
                        done(err);
                    }
                    query('select * from users')
                        .then(
                            (res) => {
                                try {
                                    assert.notEqual(res[0].find(x => x.userid === utils.hashSha256('1')), undefined);
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

    describe('users.find()', function() {
        it('should return a correct user', function(done) {
            users.new('1', 'nick', 90, 'mies', 190, true, 1, Date.now())
                .then((user) => {
                    try {
                        assert.equal(user.username, 'nick');
                    } catch (err) {
                        done(err);
                    }
                    users.find('1')
                        .then(
                            (res) => {
                                try {
                                    assert.equal(res.username, 'nick');
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

        it('should return undefined when not found', function(done) {
            users.new('1', 'nick', 90, 'mies', 190, true, 1, Date.now())
                .then((user) => {
                    try {
                        assert.equal(user.username, 'nick');
                    } catch (err) {
                        done(err);
                    }
                    users.find('2')
                        .then(
                            (res) => {
                                try {
                                    assert.equal(res, undefined);
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

    describe('User.drinkBooze()', function() {
        it('should insert a correct amount of drink to db', function(done) {
            const user = blakkistest.users[2];
            query('select * from users_drinks where userid=$1', [user.userId])
                .then((res) => {
                    const rows = res[0];
                    if (rows.length > 0) {
                        done(new Error('user doesn\'t have 0 drinks in db'));
                    }
                    user.drinkBooze(12347, 'kalja')
                        .then(() => {
                            query('select * from users_drinks where userId=$1', [user.userId])
                                .then((res) => {
                                    const rows = res[0];
                                    if (rows.length !== 1) {
                                        done(new Error('user doesn\'t have 1 drinks in db'));
                                    }
                                    if (rows[0].alcohol !== 12347) {
                                        done(new Error('invalid amount of alcohol in db'));
                                    }
                                    done();
                                }, (err) => {
                                    done(err);
                                });
                        });
                }, (err) => {
                    done(err);
                });
        });
    });
});