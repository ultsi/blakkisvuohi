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
    blakkistest.js
    helper functions to ease testing
*/

'use strict';

const utils = require('../app/lib/utils.js');
const users = require('../app/db/users.js');
const groups = require('../app/db/groups.js');
const when = require('when');
const query = require('pg-query');
query.connectionParameters = process.env.DATABASE_URL;

const blakkistest = module.exports = {};

blakkistest.users = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}]; // 10 users
blakkistest.users = blakkistest.users.map((user, i) => new users.User(utils.hashSha256(100+i), i + '', 80 + i, 'mies', 180 + i, true, 1, Date.now())
);
const group = new groups.Group(1);

blakkistest.groups = [{
    group: group,
    users: blakkistest.users.map(user => user.userId)
}];

let userInsertValuesStr = blakkistest.users.map(user => {
    return `('${user.userId}', '${utils.encrypt(user.username)}', ${user.weight}, '${user.gender}', ${user.height}, ${user.read_terms}, ${user.read_announcements})`;
});
let userInGroupsValuesStr = blakkistest.groups.map(group => {
    return group.users.map(userId => `('${group.group.groupId}', '${userId}')`).join(', ');
});

/*
    for use as a beforeEach function
*/
blakkistest.clearDb = function(done) {
    when.all([
        query('delete from users'),
        query('delete from users_drinks'),
        query('delete from users_in_groups')
    ]).spread(() => {
        done();
    }, (err) => {
        done(new Error(err));
    });
};

blakkistest.resetDbWithTestUsersAndGroups = function(done) {
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
};

blakkistest.resetDbWithTestUsersAndGroupsAndDrinks = function(done) {
    when.all([
        query('delete from users'),
        query('delete from users_drinks'),
        query('delete from users_in_groups')
    ]).spread(() => {
        when.all([
                query('insert into users (userid, nick, weight, gender, height, read_terms, read_announcements) values ' + userInsertValuesStr.join(', ')),
                query('insert into users_in_groups (groupid, userid) values ' + userInGroupsValuesStr.join(', ')),
                query(`insert into users_drinks (userid, alcohol, description) values ('${blakkistest.users[0].userId}', 12347, 'kalja'), ('${blakkistest.users[0].userId}', 12347, 'kalja'), ('${blakkistest.users[1].userId}', 12347, 'kalja')`)
            ])
            .spread(() => done()).catch((err) => done(new Error(err)));
    }, (err) => {
        done(new Error(err));
    });
};