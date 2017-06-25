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
  if(utils.isValidNumber(params[1])){
    err.push('Paino on väärin. Käytä kokonaislukuja.');
  }
  if(!isValidGender(gender.toLowerCase())){
    err.push('Sukupuoli on väärin. Käytä mies/nainen.');
  }
  if(err.length > 0){
    return deferred.reject(err.join('\n'));
  }
  query('insert into users (userId, nick, weight, gender) values ($1, $2, $3)', params)
  .then(function(){
    deferred.resolve(user(params[0], nick, params[2], gender));
  }, function(err) {
    deferred.reject(err);
  });
  return deferred.promise();
};

module.exports = user;
