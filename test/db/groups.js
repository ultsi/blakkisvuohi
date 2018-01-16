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

    describe('group.getDrinkSum()', function() {
        it('should return sum of drinks for group and min(created) Date', function(done) {
            const group = blakkistest.groups[0].group;
            group.getDrinkSum()
                .then((res) => {
                    try {
                        assert.equal(res.sum, 12347*3);
                        assert(res.created instanceof Date);
                    } catch (err) {
                        return done(err);
                    }
                    done();
                })
                .catch((err) => done(err));
        });
    });
});