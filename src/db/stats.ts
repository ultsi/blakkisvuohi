/*
    Bläkkisvuohi, a Telegram bot to help track estimated blood alcohol concentration.
    Copyright (C) 2017  Joonas Ulmanen

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

/*
    stats.js
    Get stats from the database.
*/

'use strict'
import * as pg from 'pg'
const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
})
import * as loglevel from 'loglevel'
const log = loglevel.getLogger('db')
import * as utils from '../lib/utils'

export function getGlobalStats() {
    log.debug('Fetching stats from database')
    return Promise.all([
        pool.query('select count(distinct users.userid) from users_drinks join users on users.userid=users_drinks.userid where users_drinks.created >= NOW() - INTERVAL \'14 days\''),
        pool.query('select count(distinct users.userid) from users_drinks join users on users.userid=users_drinks.userid where users_drinks.created >= NOW() - INTERVAL \'7 days\''),
        pool.query('select count(distinct userid) from users'),
        pool.query('select count(distinct groupid) from users_drinks join users on users.userid=users_drinks.userid join users_in_groups on users_in_groups.userid=users.userid where users_drinks.created >= NOW() - INTERVAL \'14 days\''),
        pool.query('select count(distinct groupid) from users_drinks join users on users.userid=users_drinks.userid join users_in_groups on users_in_groups.userid=users.userid where users_drinks.created >= NOW() - INTERVAL \'7 days\''),
        pool.query('select count(distinct groupid) from users_in_groups'),
        pool.query('select drinks.userid, nick, count from (select userid, count(*) as count from users_drinks group by userid) as drinks join users on users.userid=drinks.userid order by count desc limit 10'),
        pool.query('select count(distinct id) from users_drinks')
    ]).then(
        (res) => {
            return Promise.resolve({
                activeUsers14DaysCount: res[0].rows[0].count,
                activeUsers7DaysCount: res[1].rows[0].count,
                usersCount: res[2].rows[0].count,
                activeGroups14DaysCount: res[3].rows[0].count,
                activeGroups7DaysCount: res[4].rows[0].count,
                groupsCount: res[5].rows[0].count,
                top10UserStats: res[6].rows,
                drinkCount: res[7].rows[0].count
            })
        }).catch((err) => {
        log.error(err)
        log.debug(err.stack)
        return Promise.reject(err)
    })
}

export function getGroupStats(group, hours) {
    const hoursAgo = utils.getDateMinusHours(hours)
    log.debug('Fetching group stats from database')
    return Promise.all([
        pool.query('select drinks.userid, nick, count from (select userid, count(*) as count from users_drinks where users_drinks.created >= $2 group by userid) as drinks left outer join users on users.userid=drinks.userid left outer join users_in_groups on users_in_groups.userid=users.userid where users_in_groups.groupid=$1 order by count desc limit 10', [group.groupId, hoursAgo]),
        pool.query('select sum(alcohol) as sum, min(created) as created from users_in_groups left outer join users_drinks on users_drinks.userid=users_in_groups.userid and users_in_groups.groupid=$1 and users_drinks.created >= $2', [group.groupId, hoursAgo]),
        pool.query('select count(distinct id) from users_drinks')
    ]).then((res) => {
        return Promise.resolve({
            top10UserStats: res[0].rows,
            groupDrinkSum: res[1].rows[0],
            drinkCount: res[2].rows[0].count
        })
    }).catch((err) => {
        log.error(err)
        log.debug(err.stack)
        return Promise.reject(err)
    })
}

export function getGroupAlcoholSumStats(group, hours) {
    const hoursAgo = utils.getDateMinusHours(hours)
    log.debug('Fetching group stats from database')
    return Promise.all([
        pool.query('select drinks.userid, nick, sum from (select userid, sum(alcohol) as sum from users_drinks where users_drinks.created >= $2 group by userid) as drinks left outer join users on users.userid=drinks.userid left outer join users_in_groups on users_in_groups.userid=users.userid where users_in_groups.groupid=$1 order by sum desc limit 10', [group.groupId, hoursAgo]),
        pool.query('select sum(alcohol) as sum, min(created) as created from users_in_groups left outer join users_drinks on users_drinks.userid=users_in_groups.userid and users_in_groups.groupid=$1 and users_drinks.created >= $2', [group.groupId, hoursAgo]),
        pool.query('select sum(alcohol) from users_drinks')
    ]).then((res) => {
        return Promise.resolve({
            top10UserStats: res[0].rows,
            groupDrinkSum: res[1].rows[0],
            drinkSum: res[2].rows[0].sum
        })
    }).catch((err) => {
        log.error(err)
        log.debug(err.stack)
        return Promise.reject(err)
    })
}