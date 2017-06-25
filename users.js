'use strict';
const query = require('pg-query');
const when = require('when');
const utils = require('./utils.js');
query.connectionParameters = process.env.DATABASE_URL;

let users = {};

function isValidGender(gender){
  return gender === 'mies' || gender === 'nainen';
}

function user(userId, nick, weight, gender) {
  return {
    userId: userId,
    nick: nick,
    weight: weight,
    gender: gender
  };
}

users.new = function(userId, nick, weight, gender) {
  let deferred = when.defer();
  let params = [parseInt(userId, 10), nick, parseInt(weight, 10), gender];
  let err = [];
  if(!utils.isValidNumber(params[0])){
    err.push('Komennon suorittamisessa tapahtui virhe. Kokeile myöhemmin uudelleen.');
  }
  if(nick.length < 1){
    err.push('Komennon suorittamisessa tapahtui virhe. Kokeile myöhemmin uudelleen.');
  }
  if(!utils.isValidNumber(params[2])){
    err.push('Paino on väärin. Käytä kokonaislukuja.');
  }
  if(!isValidGender(gender.toLowerCase())){
    err.push('Sukupuoli on väärin. Käytä mies/nainen.');
  }
  if(err.length > 0){
    deferred.reject(err.join('\n'));
    return deferred.promise;
  }
  query('insert into users (userId, nick, weight, gender) values ($1, $2, $3, $4)', params)
  .then(function(){
    deferred.resolve(user(params[0], nick, params[2], gender));
  }, function(err) {
    console.error(err);
    deferred.reject(err);
  });
  return deferred.promise;
};

users.find = function find(userId) {
  let deferred = when.defer();
  query('select userId, nick, weight, gender from users where userId=$1', [userId])
  .then(function(rows){
    console.log(rows);
    if(rows.length > 0){
      let found = rows[0][0];
      deferred.resolve(user(found.userid, found.nick, found.weight, found.gender));
    }
  }, function(err){
    console.error(err);
    deferred.reject('Ota adminiin yhteyttä.');
  });
  return deferred.promise;
};

users.drinkBooze = function(user, amount) {
  let deferred = when.defer();
  query('insert into users_drinks (userId, alcohol) values($1, $2)', [user.userId, amount])
  .then(function(){
    deferred.resolve();
  }, function(err){
    console.error(err);
    deferred.reject('Ota adminiin yhteyttä.');
  });
  return deferred.promise;
};

module.exports = users;
