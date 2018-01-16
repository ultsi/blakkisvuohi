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
const when = require('when');
const log = require('loglevel').getLogger('db');
const utils = require('../lib/utils.js');
const groups = require('../db/groups.js');
query.connectionParameters = process.env.DATABASE_URL;

let stats = module.exports = {};

stats.getGlobalStats = function() {
    let deferred = when.defer();
    log.debug('Fetching stats from database');
    when.all([
        query('select count(distinct users.userid) from users_drinks join users on users.userid=users_drinks.userid where users_drinks.created >= NOW() - INTERVAL \'14 days\''),
        query('select count(distinct users.userid) from users_drinks join users on users.userid=users_drinks.userid where users_drinks.created >= NOW() - INTERVAL \'7 days\''),
        query('select count(distinct userid) from users'),
        query('select count(distinct groupid) from users_drinks join users on users.userid=users_drinks.userid join users_in_groups on users_in_groups.userid=users.userid where users_drinks.created >= NOW() - INTERVAL \'14 days\''),
        query('select count(distinct groupid) from users_drinks join users on users.userid=users_drinks.userid join users_in_groups on users_in_groups.userid=users.userid where users_drinks.created >= NOW() - INTERVAL \'7 days\''),
        query('select count(distinct groupid) from users_in_groups'),
        query('select drinks.userid, nick, count from (select userid, count(*) as count from users_drinks group by userid) as drinks join users on users.userid=drinks.userid order by count desc limit 10')
    ]).spread(
        (activeUsers14DaysCount, activeUsers7DaysCount, usersCount, activeGroups14DaysCount, activeGroups7DaysCount, groupsCount, top10UserStats) => {
            deferred.resolve({
                activeUsers14DaysCount: activeUsers14DaysCount[0][0].count,
                activeUsers7DaysCount: activeUsers7DaysCount[0][0].count,
                usersCount: usersCount[0][0].count,
                activeGroups14DaysCount: activeGroups14DaysCount[0][0].count,
                activeGroups7DaysCount: activeGroups7DaysCount[0][0].count,
                groupsCount: groupsCount[0][0].count,
                top10UserStats: top10UserStats[0]
            });
        }).catch((err) => {
            log.error(err);
            log.debug(err.stack);
            deferred.reject(err);
        });

    return deferred.promise;
};

stats.getGroupStats = function(group, hours) {
    let deferred = when.defer();
    console.log(group);
    const hoursAgo = utils.getDateMinusHours(hours);
    log.debug('Fetching group stats from database');
    when.all([
        query('select drinks.userid, nick, count from (select userid, count(*) as count from users_drinks where users_drinks.created >= $2 group by userid) as drinks join users on users.userid=drinks.userid join users_in_groups on users_in_groups.userid=users.userid where users_in_groups.groupid=$1 order by count desc limit 10', [group.groupId, hoursAgo]),
        query('select sum(alcohol) as sum, min(created) as created from users_in_groups left outer join users_drinks on users_drinks.userid=users_in_groups.userid and users_in_groups.groupid=$1 and users_drinks.created >= $2', [group.groupId, hoursAgo])
    ]).spread((top10UserStats, groupDrinkSum) => {
        deferred.resolve({
            top10UserStats: top10UserStats[0],
            groupDrinkSum: groupDrinkSum[0][0]
        });
    }, (err) => {
        log.error(err);
        log.debug(err.stack);
        deferred.reject(err);
    });
    return deferred.promise;
};