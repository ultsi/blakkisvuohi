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
    users.js
    Manages the user models in database.
*/

'use strict'

import * as pg from 'pg'
const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
})
import * as loglevel from 'loglevel'
const log = loglevel.getLogger('db')
import * as utils from '../lib/utils'
import * as alcomath from '../lib/alcomath'
import announcements from '../announcements'
import settings from '../settings'

export class User {
    public userId: string
    public username: string
    public weight: number
    public gender: string
    public height: string
    public read_terms: boolean
    public read_announcements: number
    public created: any

    constructor(userId, username, weight, gender, height, read_terms = null, read_announcements = null, created = null) {
        this.userId = userId
        this.username = username
        this.weight = weight
        this.gender = gender
        this.height = height
        this.read_terms = read_terms
        this.read_announcements = read_announcements
        this.created = new Date(created)
    }
    public isAdmin() {
        return utils.hashSha256(settings.admin_id) === this.userId
    }

    public drinkBooze(amount, description) {
        return pool.query('insert into users_drinks (userId, alcohol, description) values($1, $2, $3)', [this.userId, amount, description])
    }

    public getBooze() {
        return pool.query('select alcohol, description, created from users_drinks where userId = $1 order by created asc', [this.userId])
            .then((res) => {
                return Promise.resolve(res.rows)
            })
    }

    public getDrinkSumForXHours(hours) {
        const hoursAgo = utils.getDateMinusHours(hours)
        return pool.query('select sum(alcohol) as sum, min(created) as created from users_drinks where userId = $1 and created > $2 ', [this.userId, hoursAgo])
            .then((res) => {
                return Promise.resolve(res.rows[0])
            })
    }

    public undoDrink() {
        return pool.query('delete from users_drinks where created=(select created from users_drinks where userid = $1 order by created desc limit 1)', [this.userId])
            .then((res) => {
                return Promise.resolve(res.rows)
            })
    }

    public getBoozeForLastHours(hours) {
        const hoursAgo = utils.getDateMinusHours(hours)
        return pool.query('select alcohol, description, created from users_drinks where userId = $1 and created > $2 order by created desc', [this.userId, hoursAgo.toISOString()])
            .then((res) => {
                return Promise.resolve(res.rows)
            })
    }

    public joinGroup(groupId) {
        const groupIdHash = utils.hashSha256(groupId)
        return pool.query('select userId, groupId from users_in_groups where userId=$1 and groupId=$2', [this.userId, groupIdHash])
            .then((res) => {
                const rows = res.rows
                if (rows.length > 0) {
                    return true
                } else {
                    return pool.query('insert into users_in_groups (userId, groupId) values ($1, $2)', [this.userId, groupIdHash])
                        .then(() => true)
                }
            })
    }

    public leaveGroup(groupId) {
        let groupIdHash = utils.hashSha256(groupId)
        return pool.query('select userId, groupId from users_in_groups where userId=$1 and groupId=$2', [this.userId, groupIdHash])
            .then((res) => {
                const rows = res.rows
                if (rows.length > 0) {
                    return pool.query('delete from users_in_groups where userId=$1 and groupId=$2', [this.userId, groupIdHash])
                        .then(() => true)
                } else {
                    return true
                }
            })
    }

    public drinkBoozeReturnEBAC(amount, description) {
        let self = this
        return self.drinkBooze(amount, description)
            .then(() => self.getBooze())
            .then((drinks) => {
                let ebac = alcomath.calculateEBACFromDrinks(self, drinks)
                return ebac
            })
    }

    public drinkBoozeLate(drinks, hours) {
        log.debug('Drinking late')
        const queries = []
        for (let i = 0; i < drinks.length; i += 1) {
            const drink = drinks[i]
            log.debug(drinks[i].text, drinks[i].mg)
            const hoursAgo = utils.getDateMinusHours(hours - hours / Math.max(drinks.length - 1, 1) * i)
            log.debug(hoursAgo)
            queries.push(pool.query('insert into users_drinks (userId, alcohol, description, created) values($1, $2, $3, $4)', [this.userId, drink.mg, drink.text, hoursAgo]))
        }
        return Promise.all(queries)
            .then(() => this.getBooze())
            .then((drinks) => {
                let ebac = alcomath.calculateEBACFromDrinks(this, drinks)
                return ebac
            })
    }

    public updateInfo(username, weight, gender, height, read_terms) {
        username = utils.encrypt(username)
        return pool.query('update users set nick=$1, weight=$2, gender=$3, height=$4, read_terms=$5 where userId=$6 returning userId, nick, weight, gender, read_terms, created', [username, weight, gender, height, read_terms, this.userId])
            .then((res) => {
                const found = res.rows[0]
                return new User(found.userid, utils.decrypt(found.nick), found.weight, found.gender, found.height, found.read_terms, found.read_announcements, found.created)
            })
    }

    public updateReadAnnouncements(read_announcements_count) {
        return pool.query('update users set read_announcements=$1 where userId=$2', [read_announcements_count, this.userId])
    }

    public updateWeight(weight) {
        return pool.query('update users set weight=$1 where userId=$2', [weight, this.userId])
    }

    public updateHeight(height) {
        return pool.query('update users set height=$1 where userId=$2', [height, this.userId])
    }

    public updateGender(gender) {
        return pool.query('update users set gender=$1 where userId=$2', [gender, this.userId])
    }

    public updateUsername(username) {
        return pool.query('update users set nick=$1 where userId=$2', [utils.encrypt(username), this.userId])
    }

    public delete() {
        return Promise.all([
            pool.query('delete from users_in_groups where userId=$1', [this.userId]),
            pool.query('delete from users_drinks where userId=$1', [this.userId]),
            pool.query('delete from users where userId=$1', [this.userId])
        ])
    }

    public getLastDrink() {
        return pool.query('select alcohol, description, created from users_drinks where userId=$1 order by created desc limit 1', [this.userId])
            .then((res) => {
                return res.rows[0]
            })
    }

    public getEBACWithDrinksForLastHours(hours) {
        return Promise.all([
            this.getBooze(),
            this.getBoozeForLastHours(hours)
        ]).then((res) => {
            const drinks = res[0],
                last_drinks = res[1]
            const ebac = alcomath.calculateEBACFromDrinks(this, drinks)
            return {
                ebac: ebac,
                last_drinks: last_drinks
            }
        })
    }

    public getLastNUniqueDrinks(n, exclude_description) {
        n = n ? n : 1
        exclude_description = exclude_description ? exclude_description : ''
        return pool.query('select alcohol, description, created from users_drinks where created IN (select max(created) from users_drinks where userId=$1 and description not like $2::text group by description) order by created desc limit $3', [this.userId, exclude_description, n])
            .then((res) => {
                return res.rows
            })
    }

    public getDrinkTimesByUser() {
        return pool.query('select users.userId, users.nick, users.weight, users.gender, users.height, coalesce(alcohol, 0) as alcohol, description, users_drinks.created from users_drinks join users on users.userId=users_drinks.userId where users.userId=$1 and users_drinks.created >= NOW() - \'2 day\'::INTERVAL order by users_drinks.created asc', [this.userId])
            .then((res) => {
                const drinksByUser = utils.groupDrinksByUser(res.rows)
                return Promise.resolve(drinksByUser)
            })
    }
}

export function newUser(userId, nick, weight, gender, height, read_terms) {
    const params = [utils.hashSha256(parseInt(userId, 10)), utils.encrypt(nick), parseInt(weight, 10), gender, parseInt(height, 10), read_terms, announcements.length]

    log.debug('Creating user... params:')
    log.debug(params)
    return pool.query('insert into users (userId, nick, weight, gender, height, read_terms, read_announcements) values ($1, $2, $3, $4, $5, $6, $7)', params)
        .then(() => {
            console.log('created new user ' + nick)
            return new User(params[0], utils.decrypt(params[1]), params[2], gender, params[4], params[5], Date.now())
        }).catch((err) => {
            log.error(err)
            log.error(err.stack)
            return Promise.reject(err)
        })
}

export function findUser(userId) {
    userId = utils.hashSha256(userId)
    return pool.query('select userId, nick, weight, gender, height, read_terms, read_announcements, created from users where userId=$1', [userId])
        .then((res) => {
            log.debug('Finding user... ' + userId)
            let rows = res.rows
            if (rows.length > 0) {
                let found = rows[0]
                let nick = utils.decrypt(found.nick)
                return new User(found.userid, nick, found.weight, found.gender, found.height, found.read_terms, found.read_announcements, found.created)
            } else {
                return null
            }
        })
}

export function getUsernameFromMsg(msg) {
    let username = msg.from.username
    if (!username) {
        username = msg.from.first_name
        if (msg.from.last_name) {
            username = username + ' ' + msg.from.last_name
        }
    }
    return username
}