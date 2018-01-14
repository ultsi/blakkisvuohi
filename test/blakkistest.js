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
const when = require('when');
const query = require('pg-query');
query.connectionParameters = process.env.DATABASE_URL;

const blakkistest = module.exports = {};

blakkistest.users = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}]; // 10 users
blakkistest.users = blakkistest.users.map((user, i) => {
    user.userid = utils.hashSha256(100+i);
    user.username = utils.encrypt(i + '');
    user.weight = 80 + i;
    user.height = 180 + i;
    user.gender = 'mies';
    user.read_terms = true;
    user.read_announcements = 1;
    return user;
});

blakkistest.groups = [{
    id: utils.hashSha256('1'),
    users: blakkistest.users.map(user => user.userid)
}];

let userInsertValuesStr = blakkistest.users.map(user => {
    return `('${user.userid}', '${user.username}', ${user.weight}, '${user.gender}', ${user.height}, ${user.read_terms}, ${user.read_announcements})`;
});
let userInGroupsValuesStr = blakkistest.groups.map(group => {
    return group.users.map(userid => `('${group.id}', '${userid}')`).join(', ');
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
                query(`insert into users_drinks (userid, alcohol, description) values ('${blakkistest.users[0].userid}', 12347, 'kalja'), ('${blakkistest.users[0].userid}', 12347, 'kalja'), ('${blakkistest.users[1].userid}', 12347, 'kalja')`)
            ])
            .spread(() => done()).catch((err) => done(new Error(err)));
    }, (err) => {
        done(new Error(err));
    });
};