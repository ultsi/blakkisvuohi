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
    Manages the user models in database.
*/

'use strict';

const pg = require('pg');
const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL
});
const log = require('loglevel').getLogger('db');
const utils = require('../lib/utils.js');
const alcomath = require('../lib/alcomath.js');
const announcements = require('../announcements.js');
const settings = require('../settings.js');

let users = module.exports = {};

class User {
    constructor(userId, username, weight, gender, height, read_terms, read_announcements, created) {
        this.userId = userId;
        this.username = username;
        this.weight = weight;
        this.gender = gender;
        this.height = height;
        this.read_terms = read_terms;
        this.read_announcements = read_announcements;
        this.created = new Date(created);
    }
    isAdmin() {
        return utils.hashSha256(settings.admin_id) === this.userId;
    }

    drinkBooze(amount, description) {
        return pool.query('insert into users_drinks (userId, alcohol, description) values($1, $2, $3)', [this.userId, amount, description]);
    }

    getBooze() {
        return pool.query('select alcohol, description, created from users_drinks where userId = $1 order by created asc', [this.userId])
            .then((res) => {
                return Promise.resolve(res.rows);
            });
    }

    getDrinkSumForXHours(hours) {
        let hoursAgo = utils.getDateMinusHours(hours);
        return pool.query('select sum(alcohol) as sum, min(created) as created from users_drinks where userId = $1 and created > $2 ', [this.userId, hoursAgo])
            .then((res) => {
                return Promise.resolve(res.rows[0]);
            });
    }

    undoDrink() {
        return pool.query('delete from users_drinks where created=(select created from users_drinks where userid = $1 order by created desc limit 1)', [this.userId])
            .then((res) => {
                return Promise.resolve(res.rows);
            });
    }

    getBoozeForLastHours(hours) {
        let hoursAgo = utils.getDateMinusHours(hours);
        return pool.query('select alcohol, description, created from users_drinks where userId = $1 and created > $2 order by created desc', [this.userId, hoursAgo.toISOString()])
            .then((res) => {
                return Promise.resolve(res.rows);
            });
    }

    joinGroup(groupId) {
        let groupIdHash = utils.hashSha256(groupId);
        return pool.query('select userId, groupId from users_in_groups where userId=$1 and groupId=$2', [this.userId, groupIdHash])
            .then((res) => {
                const rows = res.rows;
                if (rows.length > 0) {
                    return true;
                } else {
                    return pool.query('insert into users_in_groups (userId, groupId) values ($1, $2)', [this.userId, groupIdHash]);
                }
            });
    }

    leaveGroup(groupId) {
        let groupIdHash = utils.hashSha256(groupId);
        return pool.query('select userId, groupId from users_in_groups where userId=$1 and groupId=$2', [this.userId, groupIdHash])
            .then((res) => {
                const rows = res.rows;
                if (rows.length > 0) {
                    return pool.query('delete from users_in_groups where userId=$1 and groupId=$2', [this.userId, groupIdHash]);
                } else {
                    return true;
                }
            });
    }

    drinkBoozeReturnEBAC(amount, description) {
        let self = this;
        return self.drinkBooze(amount, description)
            .then(() => self.getBooze())
            .then((drinks) => {
                let ebac = alcomath.calculateEBACFromDrinks(self, drinks);
                return ebac;
            });
    }

    drinkBoozeLate(drinks, hours) {
        let self = this;
        log.debug('Drinking late');
        let queries = [];
        for (let i in drinks) {
            log.debug(drinks[i].text, drinks[i].mg);
            let drink = drinks[i];
            let hoursAgo = utils.getDateMinusHours(hours - hours / Math.max(drinks.length - 1, 1) * i);
            log.debug(hoursAgo);
            queries.push(pool.query('insert into users_drinks (userId, alcohol, description, created) values($1, $2, $3, $4)', [this.userId, drink.mg, drink.text, hoursAgo]));
        }
        return Promise.all(queries)
            .then(() => self.getBooze())
            .then((drinks) => {
                let ebac = alcomath.calculateEBACFromDrinks(self, drinks);
                return ebac;
            });
    }

    updateInfo(username, weight, gender, height, read_terms) {
        let self = this;
        username = utils.encrypt(username);
        return pool.query('update users set nick=$1, weight=$2, gender=$3, height=$4, read_terms=$5 where userId=$6 returning userId, nick, weight, gender, read_terms, created', [username, weight, gender, height, read_terms, self.userId])
            .then((res) => {
                const found = res.rows[0];
                return new User(found.userid, utils.decrypt(found.nick), found.weight, found.gender, found.height, found.read_terms, found.read_announcements, found.created);
            });
    }

    updateReadAnnouncements(read_announcements_count) {
        const self = this;
        return pool.query('update users set read_announcements=$1 where userId=$2', [read_announcements_count, self.userId]);
    }

    updateWeight(weight) {
        return pool.query('update users set weight=$1 where userId=$2', [weight, this.userId]);
    }

    updateHeight(height) {
        return pool.query('update users set height=$1 where userId=$2', [height, this.userId]);
    }

    updateGender(gender) {
        return pool.query('update users set gender=$1 where userId=$2', [gender, this.userId]);
    }
}

users.User = User;

users.new = (userId, nick, weight, gender, height, read_terms) => {
    const params = [utils.hashSha256(parseInt(userId, 10)), utils.encrypt(nick), parseInt(weight, 10), gender, parseInt(height, 10), read_terms, announcements.length];

    log.debug('Creating user... params:');
    log.debug(params);
    return pool.query('insert into users (userId, nick, weight, gender, height, read_terms, read_announcements) values ($1, $2, $3, $4, $5, $6, $7)', params)
        .then(() => {
            console.log('created new user ' + nick);
            return new User(params[0], utils.decrypt(params[1]), params[2], gender, params[4], params[5], Date.now());
        }).catch((err) => {
            log.error(err);
            log.error(err.stack);
            return Promise.reject(err);
        });
};

users.find = (userId) => {
    userId = utils.hashSha256(userId);
    return pool.query('select userId, nick, weight, gender, height, read_terms, read_announcements, created from users where userId=$1', [userId])
        .then((res) => {
            log.debug('Finding user... ' + userId);
            let rows = res.rows;
            if (rows.length > 0) {
                let found = rows[0];
                let nick = utils.decrypt(found.nick);
                return new User(found.userid, nick, found.weight, found.gender, found.height, found.read_terms, found.read_announcements, found.created);
            } else {
                return null;
            }
        });
};