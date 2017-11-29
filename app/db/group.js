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
 group.js
 All group related database actions 
*/

'use strict';
const query = require('pg-query');
const when = require('when');
const utils = require('./lib/utils.js');
query.connectionParameters = process.env.DATABASE_URL;

let group = module.exports = {};

function groupDrinksByUser(drinks) {
    let drinksByUser = {};
    for (var i in drinks) {
        let drink = drinks[i];
        if (!drinksByUser[drink.userid]) {
            drinksByUser[drink.userid] = {
                userid: drink.userid,
                nick: drink.nick,
                weight: drink.weight,
                gender: drink.gender,
                drinks: []
            };
        }
        drinksByUser[drink.userid].drinks.push(drink);
    }
    return drinksByUser;
}

group.getDrinkSum = function(groupId) {
    let deferred = when.defer();
    query('select sum(alcohol) as sum, min(created) as created from users_in_groups left outer join users_drinks on users_drinks.userid=users_in_groups.userid and users_in_groups.groupid=$1', [groupId])
        .then(function(res) {
            deferred.resolve(res[0][0]);
        }, function(err) {
            console.error(err.stack);
            deferred.reject(err);
        });
    return deferred.promise;
};

group.getDrinkSumForXHours = function(groupId, hours) {
    let deferred = when.defer();
    let hoursAgo = utils.getDateMinusHours(hours);
    query('select sum(alcohol) as sum, min(created) as created from users_in_groups left outer join users_drinks on users_drinks.userid=users_in_groups.userid and users_in_groups.groupid=$1 and users_drinks.created >= $2', [groupId, hoursAgo])
        .then(function(res) {
            deferred.resolve(res[0][0]);
        }, function(err) {
            console.error(err.stack);
            deferred.reject(err);
        });
    return deferred.promise;
};

group.getDrinkSumsByUser = function(groupId, hours) {
    hours = hours ? hours : 24;

    let deferred = when.defer();
    let oneDayAgo = utils.getDateMinusHours(hours);
    query('select users.userId, users.nick, sum(alcohol) as sum from users_in_groups left outer join users_drinks on users_drinks.userid=users_in_groups.userid join users on users.userId=users_in_groups.userId where users_in_groups.groupId=$1 and users_drinks.created >= $2 group by users.userId', [groupId, oneDayAgo])
        .then(function(res) {
            let drinkSums = res[0];
            let drinkSumsByUser = {};
            for (var i in drinkSums) {
                let drinkSum = drinkSums[i];
                drinkSumsByUser[drinkSum.userid] = {
                    userid: drinkSum.userid,
                    nick: drinkSum.nick,
                    sum: drinkSum.sum
                };
            }
            deferred.resolve(drinkSumsByUser);
        }, function(err) {
            console.error(err);
            deferred.reject('Ota adminiin yhteyttä.');
        });
    return deferred.promise;
};

group.getDrinkTimesByUser = function(groupId) {
    let deferred = when.defer();
    query('select users.userId, users.nick, users.weight, users.gender, coalesce(alcohol, 0) as alcohol, description, created from users_in_groups left outer join users_drinks on users_in_groups.userId=users_drinks.userId join users on users.userId=users_in_groups.userId where users_in_groups.groupId=$1 and created >= NOW() - \'2 day\'::INTERVAL order by created asc', [groupId])
        .then(function(res) {
            let drinksByUser = groupDrinksByUser(res[0]);
            deferred.resolve(drinksByUser);
        }, function(err) {
            console.error(err);
            deferred.reject('Ota adminiin yhteyttä.');
        });
    return deferred.promise;
};


group.getBoozeByHour = function(groupId) {
    let deferred = when.defer();
    query('select users.userId, users.nick, users.weight, users.gender, (sum(sum(alcohol)) OVER (ORDER BY to_char(created, \'HH24:00\'))) as sum, to_char(created, \'HH24:00\') as time, to_char(created, \'YYYY-MM-DD HH24:00:00.000000+00\') as created_hour from users_drinks join users_in_groups on users_drinks.userid=users_in_groups.userid join users on users.userid=users_drinks.userid where groupid=$1 and created >= NOW() - \'1 day\'::INTERVAL group by time, users.userid, users.nick, users.weight, users.gender, users_drinks.alcohol, created_hour order by created_hour', [groupId])
        .then(function(res) {
            deferred.resolve(res[0]);
        }, function(err) {
            console.error(err);
            deferred.reject('Ota adminiin yhteyttä.');
        });
    return deferred.promise;
};