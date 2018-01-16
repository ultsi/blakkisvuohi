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
    All group related database actions
*/

'use strict';
const query = require('pg-query');
const when = require('when');
const log = require('loglevel').getLogger('db');
const utils = require('../lib/utils.js');
const alcomath = require('../lib/alcomath.js');
const constants = require('../constants.js');
const users = require('./users.js');
query.connectionParameters = process.env.DATABASE_URL;

let groups = module.exports = {};

function Group(groupId) {
    this.groupId = utils.hashSha256(groupId);
}

groups.Group = Group;

function groupDrinksByUser(drinks) {
    let drinksByUser = {};
    for (var i in drinks) {
        let drink = drinks[i];
        if (!drinksByUser[drink.userid]) {
            drinksByUser[drink.userid] = {
                userid: drink.userid,
                nick: utils.decrypt(drink.nick),
                weight: drink.weight,
                gender: drink.gender,
                height: drink.height,
                drinks: []
            };
        }
        drinksByUser[drink.userid].drinks.push(drink);
    }
    return drinksByUser;
}

Group.prototype.getDrinkSum = function() {
    let deferred = when.defer();
    query('select coalesce(sum(alcohol), 0) as sum, coalesce(min(users_drinks.created), now()) as created from users_in_groups left outer join users_drinks on users_drinks.userid=users_in_groups.userid and users_in_groups.groupid=$1', [this.groupId])
        .then((res) => {
            deferred.resolve(res[0][0]);
        }, (err) => {
            log.error(err);
            log.debug(err.stack);
            deferred.reject(err);
        });
    return deferred.promise;
};

Group.prototype.getDrinkSumForXHours = function(hours) {
    let deferred = when.defer();
    let hoursAgo = utils.getDateMinusHours(hours);
    query('select coalesce(sum(alcohol), 0) as sum, coalesce(min(users_drinks.created), now()) as created from users_in_groups left outer join users_drinks on users_drinks.userid=users_in_groups.userid and users_in_groups.groupid=$1 and users_drinks.created >= $2', [this.groupId, hoursAgo])
        .then((res) => {
            deferred.resolve(res[0][0]);
        }, (err) => {
            log.error(err);
            log.debug(err.stack);
            deferred.reject(err);
        });
    return deferred.promise;
};

Group.prototype.getDrinkSumsByUser = function(hours) {
    hours = hours ? hours : 24;

    let deferred = when.defer();
    let oneDayAgo = utils.getDateMinusHours(hours);
    query('select users.userId, users.nick, sum(alcohol) as sum from users_in_groups left outer join users_drinks on users_drinks.userid=users_in_groups.userid join users on users.userId=users_in_groups.userId where users_in_groups.groupId=$1 and users_drinks.created >= $2 group by users.userId', [this.groupId, oneDayAgo])
        .then((res) => {
            let drinkSums = res[0];
            let drinkSumsByUser = {};
            for (var i in drinkSums) {
                let drinkSum = drinkSums[i];
                drinkSumsByUser[drinkSum.userid] = {
                    userid: drinkSum.userid,
                    nick: utils.decrypt(drinkSum.nick),
                    sum: drinkSum.sum
                };
            }
            deferred.resolve(drinkSumsByUser);
        }, (err) => {
            log.error(err);
            log.debug(err.stack);
            deferred.reject('Ota adminiin yhteyttä.');
        });
    return deferred.promise;
};

Group.prototype.getDrinkTimesByUser = function() {
    let deferred = when.defer();
    query('select users.userId, users.nick, users.weight, users.gender, users.height, coalesce(alcohol, 0) as alcohol, description, users_drinks.created from users_in_groups left outer join users_drinks on users_in_groups.userId=users_drinks.userId join users on users.userId=users_in_groups.userId where users_in_groups.groupId=$1 and users_drinks.created >= NOW() - \'2 day\'::INTERVAL order by users_drinks.created asc', [this.groupId])
        .then((res) => {
            let drinksByUser = groupDrinksByUser(res[0]);
            deferred.resolve(drinksByUser);
        }, (err) => {
            log.error(err);
            log.debug(err.stack);
            deferred.reject('Ota adminiin yhteyttä.');
        });
    return deferred.promise;
};

Group.prototype.getStandardDrinksListing = function() {
    let deferred = when.defer();
    let self = this;
    when.all([
        self.getDrinkTimesByUser(),
        self.getDrinkSumsByUser(12),
        self.getDrinkSumsByUser(24)
    ]).spread((drinksByUser, drinkSumsByUser12h, drinkSumsByUser24h) => {
        try {
            let drinks = [];
            for (var userId in drinksByUser) {
                let details = drinksByUser[userId];
                let user = new users.User(details.userid, details.nick, details.weight, details.gender, details.height);
                let userEBAC = alcomath.calculateEBACFromDrinks(user, details.drinks);
                let userGrams = userEBAC.grams;
                if (userGrams > 0) {
                    let sum12h = drinkSumsByUser12h[details.userid] && drinkSumsByUser12h[details.userid].sum || 0;
                    let sum24h = drinkSumsByUser24h[details.userid] && drinkSumsByUser24h[details.userid].sum || 0;
                    drinks.push([user.username, userGrams / (constants.STANDARD_DRINK_GRAMS), sum12h / (constants.STANDARD_DRINK_GRAMS * 1000), sum24h / (constants.STANDARD_DRINK_GRAMS * 1000)]);
                }
            }
            drinks = drinks.sort((a, b) => {
                return b[1] - a[1];
            });
            deferred.resolve(drinks);
        } catch (err) {
            log.error(err);
            log.debug(err.stack);
            deferred.reject('Isompi ongelma, ota yhteyttä adminiin.');
        }
    }, (err) => {
        log.error(err);
        log.debug(err.stack);
        deferred.reject('Isompi ongelma, ota yhteyttä adminiin.');
    });
    return deferred.promise;
};

Group.prototype.getPermillesListing = function() {
    let deferred = when.defer();
    let self = this;
    when.all([
        self.getDrinkTimesByUser(),
        self.getDrinkSumsByUser(12),
        self.getDrinkSumsByUser(24)
    ]).spread((drinksByUser, drinkSumsByUser12h, drinkSumsByUser24h) => {
        try {
            let permilles = [];
            for (var userId in drinksByUser) {
                let details = drinksByUser[userId];
                let user = new users.User(details.userid, details.nick, details.weight, details.gender, details.height);
                let ebac = alcomath.calculateEBACFromDrinks(user, details.drinks);
                let userPermilles = ebac.permilles;
                if (userPermilles > 0) {
                    let sum12h = drinkSumsByUser12h[details.userid] && drinkSumsByUser12h[details.userid].sum || 0;
                    let sum24h = drinkSumsByUser24h[details.userid] && drinkSumsByUser24h[details.userid].sum || 0;
                    permilles.push([user.username, userPermilles, sum12h / (constants.STANDARD_DRINK_GRAMS * 1000), sum24h / (constants.STANDARD_DRINK_GRAMS * 1000)]);
                }
            }
            permilles = permilles.sort((a, b) => {
                return b[1] - a[1];
            });
            deferred.resolve(permilles);
        } catch (err) {
            log.error(err);
            log.debug(err.stack);
            deferred.reject('Isompi ongelma, ota yhteyttä adminiin.');
        }
    }, (err) => {
        log.error(err);
        log.debug(err.stack);
        deferred.reject('Isompi ongelma, ota yhteyttä adminiin.');
    });
    return deferred.promise;
};
