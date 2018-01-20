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
const query = require('pg-query');
const when = require('when');
const log = require('loglevel').getLogger('db');
const utils = require('../lib/utils.js');
const alcomath = require('../lib/alcomath.js');
const announcements = require('../announcements.js');
query.connectionParameters = process.env.DATABASE_URL;

let users = module.exports = {};

function User(userId, username, weight, gender, height, read_terms, read_announcements, created) {
    this.userId = userId;
    this.username = username;
    this.weight = weight;
    this.gender = gender;
    this.height = height;
    this.read_terms = read_terms;
    this.read_announcements = read_announcements;
    this.created = new Date(created);
}

users.User = User;

users.new = function(userId, nick, weight, gender, height, read_terms) {
    let deferred = when.defer();
    const params = [utils.hashSha256(parseInt(userId, 10)), utils.encrypt(nick), parseInt(weight, 10), gender, parseInt(height, 10), read_terms, announcements.length];

    log.debug('Creating user... params:');
    log.debug(params);
    query('insert into users (userId, nick, weight, gender, height, read_terms, read_announcements) values ($1, $2, $3, $4, $5, $6, $7)', params)
        .then(() => {
            console.log('created new user ' + nick);
            deferred.resolve(new User(params[0], utils.decrypt(params[1]), params[2], gender, params[4], params[5], Date.now()));
        }, (err) => {
            log.error(err);
            log.error(err.stack);
            deferred.reject(err);
        });
    return deferred.promise;
};

users.find = function find(userId) {
    userId = utils.hashSha256(userId);
    return query('select userId, nick, weight, gender, height, read_terms, read_announcements, created from users where userId=$1', [userId])
        .then((res) => {
            log.debug('Finding user... ' + userId);
            let rows = res[0];
            let info = res[1];
            if (rows.length > 0 && info.rowCount > 0) {
                try {
                    let found = rows[0];
                    let nick = utils.decrypt(found.nick);
                    return Promise.resolve(new User(found.userid, nick, found.weight, found.gender, found.height, found.read_terms, found.read_announcements, found.created));
                } catch (err) {
                    return Promise.reject(err);
                }
            } else {
                return Promise.resolve();
            }
        }).catch((err) => {
            log.error(err);
            log.error(err.stack);
            return Promise.reject(err);
        });
};

User.prototype.drinkBooze = function(amount, description) {
    let deferred = when.defer();
    query('insert into users_drinks (userId, alcohol, description) values($1, $2, $3)', [this.userId, amount, description])
        .then(() => {
            deferred.resolve(amount);
        }, (err) => {
            log.error(err);
            log.debug(err.stack);
            deferred.reject(err);
        });
    return deferred.promise;
};

User.prototype.getBooze = function() {
    let deferred = when.defer();
    query('select alcohol, description, created from users_drinks where userId = $1 order by created asc', [this.userId])
        .then((res) => {
            deferred.resolve(res[0]);
        }, (err) => {
            log.error(err);
            log.debug(err.stack);
            deferred.reject(err);
        });
    return deferred.promise;
};

User.prototype.getDrinkSumForXHours = function(hours) {
    let deferred = when.defer();
    let hoursAgo = utils.getDateMinusHours(hours);
    query('select sum(alcohol) as sum, min(created) as created from users_drinks where userId = $1 and created > $2 ', [this.userId, hoursAgo])
        .then((res) => {
            deferred.resolve(res[0][0]);
        }, (err) => {
            log.error(err);
            log.debug(err.stack);
            deferred.reject(err);
        });
    return deferred.promise;
};

User.prototype.undoDrink = function() {
    let deferred = when.defer();
    query('delete from users_drinks where created=(select created from users_drinks where userid = $1 order by created desc limit 1)', [this.userId])
        .then((res) => {
            deferred.resolve(res[0]);
        }, (err) => {
            log.error(err);
            log.debug(err.stack);
            deferred.reject(err);
        });
    return deferred.promise;
};

User.prototype.getBoozeForLastHours = function(hours) {
    let deferred = when.defer();
    let hoursAgo = utils.getDateMinusHours(hours);
    query('select alcohol, description, created from users_drinks where userId = $1 and created > $2 order by created desc', [this.userId, hoursAgo.toISOString()])
        .then((res) => {
            deferred.resolve(res[0]);
        }, (err) => {
            log.error(err);
            log.debug(err.stack);
            deferred.reject(err);
        });
    return deferred.promise;
};

User.prototype.joinGroup = function(groupId) {
    let deferred = when.defer();
    let groupIdHash = utils.hashSha256(groupId);
    query('insert into users_in_groups (userId, groupId) values ($1, $2)', [this.userId, groupIdHash])
        .then((res) => {
            deferred.resolve(res[0]);
        }, (err) => {
            log.error(err);
            log.debug(err.stack);
            deferred.reject('Ota adminiin yhteyttä.');
        });
    return deferred.promise;
};

User.prototype.drinkBoozeReturnEBAC = function(amount, description) {
    let deferred = when.defer();
    let self = this;
    self.drinkBooze(amount, description)
        .then((amount) => {
            self.getBooze()
                .then((drinks) => {
                    let ebac = alcomath.calculateEBACFromDrinks(self, drinks);
                    deferred.resolve(ebac);
                }, (err) => {
                    log.error(err);
                    log.debug(err.stack);
                    deferred.reject(err);
                });
        }, (err) => {
            log.error(err);
            log.debug(err.stack);
            deferred.reject('Isompi ongelma, ota yhteyttä adminiin.');
        });
    return deferred.promise;
};

User.prototype.drinkBoozeLate = function(drinks, hours) {
    let deferred = when.defer();
    let self = this;
    log.debug('Drinking late');
    let queries = [];
    for (let i in drinks) {
        log.debug(drinks[i].text, drinks[i].mg);
        let drink = drinks[i];
        let hoursAgo = utils.getDateMinusHours(hours - hours / Math.max(drinks.length - 1, 1) * i);
        log.debug(hoursAgo);
        queries.push(query('insert into users_drinks (userId, alcohol, description, created) values($1, $2, $3, $4)', [this.userId, drink.mg, drink.text, hoursAgo]));
    }
    when.all(queries)
        .then(() => {
            self.getBooze()
                .then((drinks) => {
                    let ebac = alcomath.calculateEBACFromDrinks(self, drinks);
                    deferred.resolve(ebac);
                }, (err) => {
                    log.error(err);
                    log.debug(err.stack);
                    deferred.reject(err);
                });
        }, (err) => {
            log.error(err);
            log.debug(err.stack);
            deferred.reject('Isompi ongelma, ota yhteyttä adminiin.');
        });
    return deferred.promise;
};

User.prototype.updateInfo = function(username, weight, gender, height, read_terms) {
    let deferred = when.defer();
    let self = this;
    username = utils.encrypt(username);
    query('update users set nick=$1, weight=$2, gender=$3, height=$4, read_terms=$5 where userId=$6 returning userId, nick, weight, gender, read_terms, created', [username, weight, gender, height, read_terms, self.userId])
        .then((res) => {
            const found = res[0][0];
            if (found) {
                deferred.resolve(new User(found.userid, utils.decrypt(found.nick), found.weight, found.gender, found.height, found.read_terms, found.read_announcements, found.created));
            } else {
                deferred.reject('not found');
            }
        }, (err) => {
            log.error(err);
            log.debug(err.stack);
            deferred.reject(err);
        });

    return deferred.promise;
};

User.prototype.updateReadAnnouncements = function(read_announcements_count) {
    const deferred = when.defer();
    const self = this;
    query('update users set read_announcements=$1 where userId=$2', [read_announcements_count, self.userId])
        .then(() => {
            deferred.resolve();
        }, (err) => {
            log.error(err);
            log.debug(err.stack);
            deferred.reject(err);
        });

    return deferred.promise;
};