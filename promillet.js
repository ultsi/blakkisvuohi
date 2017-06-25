'use strict';

const cmd = require('./cmd.js');
const utils = require('./utils.js');
const users = require('./users.js');

const ETANOL_GRAMS_PER_LITRE = 789;

function calcAlcoholMilliGrams(vol_perc, amount) {
  return Math.round(vol_perc * ETANOL_GRAMS_PER_LITRE * amount * 1000);
}

const TOLKKI = calcAlcoholMilliGrams(0.047, 0.33);
const PINTTI = calcAlcoholMilliGrams(0.047, 0.50);

cmd.register('/luotunnus', cmd.TYPE_PRIVATE, function(msg, words){
  users.new(msg.from.id, msg.from.username, words[1], words[2])
  .then(function(user){
    utils.sendPrivateMsg(msg, 'Moikka ' + user.nick);
  }, function(err){
    utils.sendPrivateMsg(msg, err);
  });
}, '/luotunnus <paino> <mies/nainen>');

cmd.register('/whoami', cmd.TYPE_PRIVATE, function(msg, words){
  users.find(msg.from.id)
  .then(function(user){
    utils.sendPrivateMsg(msg, 'Käyttäjä ' + user.nick + ', id: ' + user.userId + ', paino: ' + user.weight + ', sukupuoli: ' + user.gender);
  }, function(err){
    utils.sendPrivateMsg(msg, err);
  });
}, '/whoami - tulosta omat tietosi.');

cmd.register('/tolkki', cmd.TYPE_PRIVATE, function(msg, words){
  users.find(msg.from.id)
  .then(function(user){
    user.drinkBooze(TOLKKI)
    .then(function(){
      utils.sendPrivateMsg(msg, 'toimii');
    }, function(err){
      utils.sendPrivateMsg(msg, err);
    });
  }, function(err){
    utils.sendPrivateMsg(msg, err);
  });
}, '/tolkki - juo yksi 0.33l');

cmd.register('/pintti', cmd.TYPE_PRIVATE, function(msg, words){
  users.find(msg.from.id)
  .then(function(user){
    users.drinkBooze(user, PINTTI)
    .then(function(){
      utils.sendPrivateMsg(msg, 'toimii');
    }, function(err){
      utils.sendPrivateMsg(msg, err);
    });
  }, function(err){
    utils.sendPrivateMsg(msg, err);
  });
}, '/pintti - juo yksi 0.5l');

cmd.register('/viina', cmd.TYPE_PRIVATE, function(msg, words){
  if(words.length < 3){
    throw 'puuttuu prosentit ja tai määrä';
  }

  users.find(msg.from.id)
  .then(function(user){
    let percent = parseFloat(words[1])/100;
    let amount = parseFloat(words[2]);
    if(percent === 'NaN' || amount === 'NaN'){
      utils.sendPrivateMsg(msg, 'Prosentti tai määrä on virheellinen!');
      return;
    }
    let alcoholInMG = calcAlcoholMilliGrams(percent, amount);
    users.drinkBooze(user, alcoholInMG)
    .then(function(){
      utils.sendPrivateMsg(msg, 'toimii');
    }, function(err){
      utils.sendPrivateMsg(msg, err);
    });
  }, function(err){
    utils.sendPrivateMsg(msg, err);
  });
}, '/viina (prosentti) (määrä litroissa). Esim. /viina 38 0.5');

function sumGrams(drinks) {
  let milligrams = 0;
  for(var i in drinks) {
    let drink = drinks[i];
    milligrams += drink.alcohol;
  }
  return milligrams;
}

cmd.register('/grammat', cmd.TYPE_ALL, function(msg, words){
  users.find(msg.from.id)
  .then(function(user){
    users.getBooze(user)
    .then(function(drinks){
      utils.sendPrivateMsg(msg, sumGrams(drinks));
    }, function(err){
      utils.sendPrivateMsg(msg, err);
    });
  }, function(err){
    utils.sendPrivateMsg(msg, err);
  });
});
