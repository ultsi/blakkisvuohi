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
const users = require('../../app/db/users.js');
const query = require('pg-query');
query.connectionParameters = process.env.DATABASE_URL;

describe('users.js', function() {
    beforeEach(function(done) {
        query('delete from users')
            .then(() => done(), (err) => done(err));
    });
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
        it('should insert a user to database', function(done) {
            users.new('id', 'nick', 90, 'mies', 190, true, 1, Date.now())
                .then(() => {
                    done();
                }, (err) => {
                    done(new Error(err));
                });
        });
    });
});