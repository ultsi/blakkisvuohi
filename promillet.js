'use strict';

const cmd = require('./cmd.js');
const utils = require('./utils.js');
const users = require('./users.js');
const when = require('when');

const ETANOL_GRAMS_PER_LITRE = 789;
const LIQUID_PERCENT = {mies: 0.58, nainen: 0.49};

function calcAlcoholMilliGrams(vol_perc, amount) {
  return Math.round(vol_perc * ETANOL_GRAMS_PER_LITRE * amount * 1000);
}

const TOLKKI = calcAlcoholMilliGrams(0.047, 0.33);
const PINTTI = calcAlcoholMilliGrams(0.047, 0.50);
const DRINK_RESPONSES = ['Bäää.', 'Uuteen nousuun.', 'Aamu alkaa A:lla.', 'Juo viinaa, viina on hyvää.', 'Meno on meno.', 'Lörs lärä, viinaa!'];

function getRandomResponse(){
  return 'Tallennettu. ' + DRINK_RESPONSES[Math.floor(Math.random()*DRINK_RESPONSES.length)];
}

cmd.register('/luotunnus', cmd.TYPE_PRIVATE, function(msg, words){
  let deferred = when.defer();
  users.new(msg.from.id, msg.from.username || msg.from.first_name + ' ' + msg.from.last_name, words[1], words[2])
  .then(function(user){
    deferred.resolve(cmd.privateResponse('Moikka ' + user.nick + '! Tunnuksesi luotiin onnistuneesti. Muista, että antamani luvut alkoholista ovat vain arvioita, eikä niihin voi täysin luottaa. Ja eikun juomaan!'));
  }, function(err){
    console.log(err);
    deferred.reject('Isompi ongelma, ota yhteyttä adminiin.');
  });
  return deferred.promise;
}, '/luotunnus <paino> <mies/nainen>. Esim. /luotunnus 90 mies');

cmd.registerUserCmd('/whoami', cmd.TYPE_PRIVATE, function(msg, words, user){
  let deferred = when.defer();
  deferred.resolve(cmd.privateResponse('Käyttäjä ' + user.nick + ', id: ' + user.userId + ', paino: ' + user.weight + ', sukupuoli: ' + user.gender));
  return deferred.promise;
}, '/whoami - tulosta omat tietosi.');

cmd.registerUserCmd('/tolkki', cmd.TYPE_PRIVATE, function(msg, words, user){
  let deferred = when.defer();
  users.drinkBooze(user, TOLKKI, '/tolkki')
    .then(function(){
      deferred.resolve(cmd.privateResponse(getRandomResponse()));
    }, function(err){
      console.error(err);
      deferred.reject('Isompi ongelma, ota yhteyttä adminiin.');
    });
  return deferred.promise;
}, '/tolkki - juo yksi 0.33l');

cmd.registerUserCmd('/pintti', cmd.TYPE_PRIVATE, function(msg, words, user){
  let deferred = when.defer();
  users.drinkBooze(user, PINTTI, '/pintti')
    .then(function(){
      deferred.resolve(cmd.privateResponse(getRandomResponse()));
    }, function(err){
      console.error(err);
      deferred.reject('Isompi ongelma, ota yhteyttä adminiin.');
    });
  return deferred.promise;
}, '/pintti - juo yksi 0.5l');

cmd.registerUserCmd('/viina', cmd.TYPE_PRIVATE, function(msg, words, user){
  let deferred = when.defer();
  if(words.length < 3){
    deferred.reject('Puuttuu prosentit ja tai määrä!');
  }
  let percent = parseFloat(words[1])/100;
  let amount = parseFloat(words[2]);
  if(percent === 'NaN' || amount === 'NaN' || percent > 1 || percent < 0 || amount > 10 || amount < 0){
    deferred.reject('Prosentti tai määrä on virheellinen!');
    return;
  }
  let alcoholInMG = calcAlcoholMilliGrams(percent, amount);
  users.drinkBooze(user, alcoholInMG, words.join(' '))
    .then(function(){
      deferred.resolve(cmd.privateResponse(getRandomResponse()));
    }, function(err){
      console.error(err);
      deferred.reject('Isompi ongelma, ota yhteyttä adminiin.');
    });
  return deferred.promise;
}, '/viina (prosentti) (määrä litroissa). Esim. /viina 38 0.5. Käytä erottimena pistettä.');

function sumGrams(drinks) {
  let milligrams = 0;
  for(var i in drinks) {
    let drink = drinks[i];
    milligrams += drink.alcohol;
  }
  return milligrams;
}

function sumGramsUnBurned(user, drinks) {
  let milligrams = 0;
  let now = Date.now();
  let lastTime = null;
  let hourInMillis = 3600 * 1000;
  let userBurnRateMilligrams = user.weight / 10.0 * 1000;
  for(var i in drinks) {
    let drink = drinks[i];
    let drinkTime = Date.parse(drink.created);
    if(lastTime) {
      let diff = drinkTime - lastTime;
      let diffInHours = diff / hourInMillis;
      milligrams -= (userBurnRateMilligrams * diffInHours);
      milligrams = milligrams > 0 ? milligrams : 0;
    }
    milligrams += drink.alcohol;
    lastTime = drinkTime;
  }
  let diff = now - lastTime;
  let diffInHours = diff / hourInMillis;
  milligrams -= userBurnRateMilligrams * diffInHours;
  return milligrams > 0 ? milligrams : 0;
}

function getPermilles(user, grams) {
  let standard_drinks = grams / 10.6;
  return (0.806 * (standard_drinks)) / (LIQUID_PERCENT[user.gender] * user.weight) * 10;
}

cmd.registerUserCmd('/annokset', cmd.TYPE_ALL, function(msg, words, user){
  let deferred = when.defer();
  users.getBooze(user)
    .then(function(drinks){
      let grams = sumGrams(drinks) / 1000.0;
      deferred.resolve(cmd.privateResponse('Olet aikojen saatossa tuhonnut ' + grams.toFixed(2) + ' grammaa alkoholia, joka vastaa ' + (grams / 12.2).toFixed(2) + ' annosta.'));
    }, function(err){
      console.error(err);
      deferred.reject('Isompi ongelma, ota yhteyttä adminiin.');
    });
  return deferred.promise;
}, '/annokset - listaa kaikki annokset.');

cmd.registerUserCmd('/polttamatta', cmd.TYPE_ALL, function(msg, words, user){
  let deferred = when.defer();
  users.getBooze(user)
  .then(function(drinks){
    try {
      let grams = sumGramsUnBurned(user, drinks) / 1000.0;
      deferred.resolve(cmd.privateResponse('Sinussa on jäljellä ' + grams.toFixed(2) + ' grammaa alkoholia, joka vastaa ' + (grams / 12.2).toFixed(2) + ' annosta.'));
    } catch (err) {
      console.error(err);
      deferred.reject('Isompi ongelma, ota yhteyttä adminiin.');
    }
  }, function(err){
    console.error(err);
    deferred.reject('Isompi ongelma, ota yhteyttä adminiin.');
  });
  return deferred.promise;
}, '/polttamatta - listaa kuinka paljon alkoholia sinulla on polttamatta.');

cmd.registerUserCmd('/promillet', cmd.TYPE_ALL, function(msg, words, user){
  let deferred = when.defer();
  if(msg.chat.type === 'private'){
    users.getBooze(user)
      .then(function(drinks){
        try {
          let grams = sumGramsUnBurned(user, drinks) / 1000.0;
          deferred.resolve(cmd.privateResponse((getPermilles(user, grams).toFixed(2) + '‰')));
        } catch (err) {
          console.error(err);
          deferred.reject('Isompi ongelma, ota yhteyttä adminiin.');
        }
      }, function(err){
        console.error(err);
        deferred.reject('Isompi ongelma, ota yhteyttä adminiin.');
      });
  } else {
    when.all([
      users.getBoozeForGroup(msg.chat.id),
      users.getDrinkCountFor24hForGroup(msg.chat.id)
    ]).spread(function(drinksByUser, drinkCountsByUser){
        try {
          let permilles = [];
          for(var userId in drinksByUser){
            let details = drinksByUser[userId];
            let user = users.create(details.userid, details.nick, details.weight, details.gender);
            let grams = sumGramsUnBurned(user, details.drinks) / 1000.0;
            if(grams > 0){
              permilles.push([user.nick, getPermilles(user, grams).toFixed(2), drinkCountsByUser[details.userid].count]);
            }
          }
          permilles = permilles.sort(user => user[1]).map(user => user[0] + '... ' + user[1] + '‰ ('+user[2]+')');
          deferred.resolve(cmd.chatResponse(msg.chat.title + ' -kavereiden rippitaso:\nKäyttäjä...‰ (annokset/24h)\n\n' + permilles.join('\n')));
        } catch (err) {
          console.error(err);
          deferred.reject('Isompi ongelma, ota yhteyttä adminiin.');
        }
    }, function(err) {
      console.error(err);
      deferred.reject('Isompi ongelma, ota yhteyttä adminiin.');
    });
  }
  return deferred.promise;
}, '/promillet - listaa kuinka paljon promilleja sinulla tai chatissa olevilla suunnilleen on.');

function makeDrinksString(drinks) {
  let list = [];
  let day = null;
  for(var i in drinks) {
    let drink = drinks[i];
    let drinkTime = new Date(Date.parse(drink.created));
    let drinkShortDate = drinkTime.getDate() + '.' + (drinkTime.getMonth()+1) + '.';
    if(day !== drinkShortDate) {
      day = drinkShortDate;
      list.push(day);
    }
    list.push(drink.description + ' ' + drinkTime.getHours() + ':' + drinkTime.getMinutes());
  }
  return list.join('\n');
}

cmd.registerUserCmd('/otinko', cmd.TYPE_PRIVATE, function(msg, words, user){
  let deferred = when.defer();
  users.getBoozeForLast48h(user)
    .then(function(drinks){
      try {
        let drinkList = makeDrinksString(drinks);
        deferred.resolve(cmd.privateResponse(drinkList));
      } catch (err) {
        console.error(err);
        deferred.reject('Isompi ongelma, ota yhteyttä adminiin.');
      }
    }, function(err){
      console.error(err);
      deferred.reject('Isompi ongelma, ota yhteyttä adminiin.');
    });
  return deferred.promise;
}, '/otinko - näyttää otitko ja kuinka monta viime yönä.');

cmd.registerUserCmd('/moro', cmd.TYPE_ALL, function(msg, words, user){
  let deferred = when.defer();
  if(msg.chat.type !== 'group'){
    deferred.reject('Käytä tätä komentoa ryhmässä!');
    return deferred.promise;
  }
  users.joinGroup(user, msg)
    .then(function(){
      deferred.resolve(cmd.chatResponse('Rippaa rauhassa kera ' + msg.chat.title + ' -kavereiden.'));
    }, function(err){
      console.error(err);
      deferred.resolve(cmd.chatResponse('Rippaa rauhassa kera ' + msg.chat.title + ' -kavereiden.'));
    });
  return deferred.promise;
}, '/moro - Lisää sinut ryhmään mukaan.');
