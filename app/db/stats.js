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
    stats.js
    Get stats from the database.
*/

'use strict';
const query = require('pg-query');
const log = require('loglevel').getLogger('db');
const utils = require('../lib/utils.js');
query.connectionParameters = process.env.DATABASE_URL;

let stats = module.exports = {};

stats.getGlobalStats = function() {
    log.debug('Fetching stats from database');
    return Promise.all([
        query('select count(distinct users.userid) from users_drinks join users on users.userid=users_drinks.userid where users_drinks.created >= NOW() - INTERVAL \'14 days\''),
        query('select count(distinct users.userid) from users_drinks join users on users.userid=users_drinks.userid where users_drinks.created >= NOW() - INTERVAL \'7 days\''),
        query('select count(distinct userid) from users'),
        query('select count(distinct groupid) from users_drinks join users on users.userid=users_drinks.userid join users_in_groups on users_in_groups.userid=users.userid where users_drinks.created >= NOW() - INTERVAL \'14 days\''),
        query('select count(distinct groupid) from users_drinks join users on users.userid=users_drinks.userid join users_in_groups on users_in_groups.userid=users.userid where users_drinks.created >= NOW() - INTERVAL \'7 days\''),
        query('select count(distinct groupid) from users_in_groups'),
        query('select drinks.userid, nick, count from (select userid, count(*) as count from users_drinks group by userid) as drinks join users on users.userid=drinks.userid order by count desc limit 10')
    ]).then(
        (res) => {
            return Promise.resolve({
                activeUsers14DaysCount: res[0][0][0].count,
                activeUsers7DaysCount: res[1][0][0].count,
                usersCount: res[2][0][0].count,
                activeGroups14DaysCount: res[3][0][0].count,
                activeGroups7DaysCount: res[4][0][0].count,
                groupsCount: res[5][0][0].count,
                top10UserStats: res[6][0]
            });
        }).catch((err) => {
        log.error(err);
        log.debug(err.stack);
        return Promise.reject(err);
    });
};

stats.getGroupStats = function(group, hours) {
    const hoursAgo = utils.getDateMinusHours(hours);
    log.debug('Fetching group stats from database');
    return Promise.all([
        query('select drinks.userid, nick, count from (select userid, count(*) as count from users_drinks where users_drinks.created >= $2 group by userid) as drinks left outer join users on users.userid=drinks.userid left outer join users_in_groups on users_in_groups.userid=users.userid where users_in_groups.groupid=$1 order by count desc limit 10', [group.groupId, hoursAgo]),
        query('select sum(alcohol) as sum, min(created) as created from users_in_groups left outer join users_drinks on users_drinks.userid=users_in_groups.userid and users_in_groups.groupid=$1 and users_drinks.created >= $2', [group.groupId, hoursAgo])
    ]).then((res) => {
        return Promise.resolve({
            top10UserStats: res[0][0],
            groupDrinkSum: res[1][0][0]
        });
    }).catch((err) => {
        log.error(err);
        log.debug(err.stack);
        return Promise.reject(err);
    });
};