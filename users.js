'use strict';
const query = require('pg-query');
const when = require('when');
const utils = require('./utils.js');
const cmd = require('./cmd.js');
query.connectionParameters = process.env.DATABASE_URL;

let users = {};

function isValidGender(gender){
  return gender === 'mies' || gender === 'nainen';
}

function User(userId, username, weight, gender) {
  this.userId = userId;
  this.username = username;
  this.weight = weight;
  this.gender = gender;
}

users.User = User;

users.new = function(userId, nick, weight, gender) {
  let deferred = when.defer();
  let params = [parseInt(userId, 10), nick, parseInt(weight, 10), gender];
  let err = [];
  if(!utils.isValidInt(params[0])){
    err.push('userid');
  }
  if(nick.length < 1){
    err.push('nick');
  }
  if(!utils.isValidInt(params[2]) && params[2] >= 40 && params[2] <= 200){
    err.push('weight');
  }
  if(!isValidGender(gender.toLowerCase())){
    err.push('gender');
  }
  if(err.length > 0){
    deferred.reject(err);
    return deferred.promise;
  }

  query('insert into users (userId, nick, weight, gender) values ($1, $2, $3, $4)', params)
  .then(function(){
    deferred.resolve(new User(params[0], nick, params[2], gender));
  }, function(err) {
    console.error(err);
    deferred.reject(err);
  });
  return deferred.promise;
};

users.find = function find(userId) {
  let deferred = when.defer();
  query('select userId, nick, weight, gender from users where userId=$1', [userId])
  .then(function(res){
    let rows = res[0];
    let info = res[1];
    if(rows.length > 0 && info.rowCount > 0){
      try {
        let found = rows[0];
        deferred.resolve(new User(found.userid, found.nick, found.weight, found.gender));
      } catch (err) {
        deferred.reject(err);
      }
    } else {
      deferred.reject('user not found');
    }
  }, function(err){
    console.error(err);
    deferred.reject(err);
  });
  return deferred.promise;
};

User.prototype.drinkBooze = function(amount, description) {
  let deferred = when.defer();
  query('insert into users_drinks (userId, alcohol, description) values($1, $2, $3)', [this.userId, amount, description])
  .then(function(){
    deferred.resolve(amount);
  }, function(err){
    console.error(err);
    deferred.reject(err);
  });
  return deferred.promise;
};

User.prototype.getBooze = function() {
  let deferred = when.defer();
  query('select alcohol, description, created from users_drinks where userId = $1 order by created asc',[this.userId])
  .then(function(res){
    deferred.resolve(res[0]);
  }, function(err){
    console.error(err);
    deferred.reject(err);
  });
  return deferred.promise;
};

User.prototype.getDrinkSumForXHours = function(hours) {
  let deferred = when.defer();
  let hoursAgo = utils.getDateMinusHours(hours);
  query('select sum(alcohol) as sum, min(created) as created from users_drinks where userId = $1 and created > $2 ',[this.userId, hoursAgo])
  .then(function(res){
    deferred.resolve(res[0][0]);
  }, function(err){
    console.error(err);
    deferred.reject(err);
  });
  return deferred.promise;
};

User.prototype.undoDrink = function() {
  let deferred = when.defer();
  query('delete from users_drinks where created=(select created from users_drinks where userid = $1 order by created desc limit 1)', [this.userId])
    .then(function(res){
      deferred.resolve(res[0]);
    }, function(err){
      console.error(err);
      console.log(err.stack);
      deferred.reject(err);
    });
  return deferred.promise;
};

User.prototype.getBoozeForLastHours = function(hours) {
  let deferred = when.defer();
  let hoursAgo = utils.getDateMinusHours(hours);
  query('select alcohol, description, created from users_drinks where userId = $1 and created > $2 order by created desc',[this.userId, hoursAgo.toISOString()])
  .then(function(res){
    deferred.resolve(res[0]);
  }, function(err){
    console.error(err);
    deferred.reject(err);
  });
  return deferred.promise;
};

User.prototype.joinGroup = function(msg) {
  let deferred = when.defer();
  query('insert into users_in_groups (userId, groupId) values ($1, $2)', [this.userId, msg.chat.id])
  .then(function(res){
    deferred.resolve(res[0]);
  }, function(err){
    console.error(err);
    deferred.reject('Ota adminiin yhteyttä.');
  });
  return deferred.promise;
};

function groupDrinksByUser(drinks) {
  let drinksByUser = {};
  for(var i in drinks){
    let drink = drinks[i];
    if(!drinksByUser[drink.userid]){
      drinksByUser[drink.userid] = {userid: drink.userid, nick: drink.nick, weight: drink.weight, gender: drink.gender, drinks: []};
    }
    drinksByUser[drink.userid].drinks.push(drink);
  }
  return drinksByUser;
}

users.getDrinkSumForGroup = function(groupId) {
  let deferred = when.defer();
  query('select sum(alcohol) as sum, min(created) as created from users_in_groups left outer join users_drinks on users_drinks.userid=users_in_groups.userid and users_in_groups.groupid=$1', [groupId])
    .then(function(res){
      deferred.resolve(res[0][0]);
    }, function(err){
      console.error(err.stack);
      deferred.reject(err);
    });
  return deferred.promise;
}

users.getDrinkSumForGroupForXHours = function(groupId, hours) {
  let deferred = when.defer();
  let hoursAgo = utils.getDateMinusHours(hours);
  query('select sum(alcohol) as sum, min(created) as created from users_in_groups left outer join users_drinks on users_drinks.userid=users_in_groups.userid and users_in_groups.groupid=$1 and users_drinks.created >= $2', [groupId, hoursAgo])
    .then(function(res){
      deferred.resolve(res[0][0]);
    }, function(err){
      console.error(err.stack);
      deferred.reject(err);
    });
  return deferred.promise;
}

users.getDrinkSumFor24hForGroup = function(groupId) {
  let deferred = when.defer();
  let oneDayAgo = utils.getDateMinusHours(24);
  query('select users.userId, users.nick, sum(alcohol) as sum from users_in_groups left outer join users_drinks on users_drinks.userid=users_in_groups.userid join users on users.userId=users_in_groups.userId where users_in_groups.groupId=$1 and users_drinks.created >= $2 group by users.userId', [groupId, oneDayAgo])
    .then(function(res){
      let drinkSums = res[0];
      let drinkSumsByUser = {};
      for(var i in drinkSums){
        let drinkSum = drinkSums[i];
        drinkSumsByUser[drinkSum.userid] = {userid: drinkSum.userid, nick: drinkSum.nick, sum: drinkSum.sum};
      }
      deferred.resolve(drinkSumsByUser);
    }, function(err){
      console.error(err);
      deferred.reject('Ota adminiin yhteyttä.');
    });
  return deferred.promise;
};

users.getDrinkSumFor12hForGroup = function(groupId) {
  let deferred = when.defer();
  let halfDayAgo = utils.getDateMinusHours(12);
  query('select users.userId, users.nick, sum(alcohol) as sum from users_in_groups left outer join users_drinks on users_drinks.userid=users_in_groups.userid join users on users.userId=users_in_groups.userId where users_in_groups.groupId=$1 and users_drinks.created >= $2 group by users.userId', [groupId, halfDayAgo])
    .then(function(res){
      let drinkSums = res[0];
      let drinkSumsByUser = {};
      for(var i in drinkSums){
        let drinkSum = drinkSums[i];
        drinkSumsByUser[drinkSum.userid] = {userid: drinkSum.userid, nick: drinkSum.nick, sum: drinkSum.sum};
      }
      deferred.resolve(drinkSumsByUser);
    }, function(err){
      console.error(err);
      deferred.reject('Ota adminiin yhteyttä.');
    });
  return deferred.promise;
};

users.getBoozeForGroup = function(groupId) {
  let deferred = when.defer();
  query('select users.userId, users.nick, users.weight, users.gender, coalesce(alcohol, 0) as alcohol, description, created from users_in_groups left outer join users_drinks on users_in_groups.userId=users_drinks.userId join users on users.userId=users_in_groups.userId where users_in_groups.groupId=$1 order by created asc',[groupId])
    .then(function(res){
      let drinksByUser = groupDrinksByUser(res[0]);
      deferred.resolve(drinksByUser);
    }, function(err){
      console.error(err);
      deferred.reject('Ota adminiin yhteyttä.');
    });
  return deferred.promise;
};

User.prototype.getDrinkCountsByGroupsForUser = function() {
  let deferred = when.defer();
  query('select count(*) as count, groupid from users_drinks join users_in_groups on users_drinks.userid=users_in_groups.userid where groupId IN (select groupId from users_in_groups where userid=$1) group by groupId', [this.userId])
    .then(function(res){
      let rows = res[0];
      deferred.resolve(rows);
    }, function(err){
      console.error(err);
      deferred.reject('Ota adminiin yhteyttä.');
    });
  return deferred.promise;
};

module.exports = users;
