'use strict';

const cmd = require('./cmd.js');
const utils = require('./utils.js');
const users = require('./users.js');
const when = require('when');

const ETANOL_GRAMS_PER_LITRE = 789;
const LIQUID_PERCENT = {mies: 0.75, nainen: 0.65};

function calcAlcoholMilliGrams(vol_perc, amount) {
  return Math.round(vol_perc * ETANOL_GRAMS_PER_LITRE * amount * 1000);
}

const TOLKKI = calcAlcoholMilliGrams(0.047, 0.33);
const PINTTI = calcAlcoholMilliGrams(0.047, 0.50);


function findUser(msg) {
  let deferred = when.defer();
  users.find(msg.from.id)
  .then(function(user){
    if(!user){
      console.log('didn\'t find user ' + msg.from.id);
      utils.sendMsg(msg, 'Moi! Juttele minulle ensiksi privassa ja luo tunnus käyttämällä komentoa /luotunnus');
      return deferred.reject('Not found');
    }
    console.log('found user ' + user.nick);
    deferred.resolve(user);
  }, function(err){
    utils.sendMsg(msg, 'Moi! Juttele minulle ensiksi privassa ja luo tunnus käyttämällä komentoa /luotunnus');
    deferred.reject(err);
  });
  return deferred.promise;
}

cmd.register('/luotunnus', cmd.TYPE_PRIVATE, function(msg, words){
  users.new(msg.from.id, msg.from.username, words[1], words[2])
  .then(function(user){
    utils.sendPrivateMsg(msg, 'Moikka ' + user.nick);
  }, function(err){
    utils.sendPrivateMsg(msg, err);
  });
}, '/luotunnus <paino> <mies/nainen>');

cmd.register('/whoami', cmd.TYPE_PRIVATE, function(msg, words){
  findUser(msg)
  .then(function(user){
    utils.sendPrivateMsg(msg, 'Käyttäjä ' + user.nick + ', id: ' + user.userId + ', paino: ' + user.weight + ', sukupuoli: ' + user.gender);
  }, function(err){
    utils.sendPrivateMsg(msg, err);
  });
}, '/whoami - tulosta omat tietosi.');

cmd.register('/tolkki', cmd.TYPE_PRIVATE, function(msg, words){
  findUser(msg)
  .then(function(user){
    users.drinkBooze(user, TOLKKI, '/tolkki')
    .then(function(){
      utils.sendPrivateMsg(msg, 'Got it.');
    }, function(err){
      utils.sendPrivateMsg(msg, 'Virhe: '+ err);
      throw 'Virhe!';
    });
  }, function(err){
    utils.sendPrivateMsg(msg, 'Virhe: '+ err);
    throw 'Virhe!';
  });
}, '/tolkki - juo yksi 0.33l');

cmd.register('/pintti', cmd.TYPE_PRIVATE, function(msg, words){
  findUser(msg)
  .then(function(user){
    users.drinkBooze(user, PINTTI, '/pintti')
    .then(function(){
      utils.sendPrivateMsg(msg, 'toimii');
    }, function(err){
      utils.sendPrivateMsg(msg, 'Virhe: '+ err);
      throw 'Virhe!';
    });
  }, function(err){
    utils.sendPrivateMsg(msg, 'Virhe: '+ err);
    throw 'Virhe!';
  });
}, '/pintti - juo yksi 0.5l');

cmd.register('/viina', cmd.TYPE_PRIVATE, function(msg, words){
  if(words.length < 3){
    throw 'puuttuu prosentit ja tai määrä';
  }

  findUser(msg)
  .then(function(user){
    let percent = parseFloat(words[1])/100;
    let amount = parseFloat(words[2]);
    if(percent === 'NaN' || amount === 'NaN'){
      utils.sendPrivateMsg(msg, 'Prosentti tai määrä on virheellinen!');
      return;
    }
    let alcoholInMG = calcAlcoholMilliGrams(percent, amount);
    users.drinkBooze(user, alcoholInMG, words.join(' '))
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

function sumGramsUnBurned(user, drinks) {
  let milligrams = 0;
  let now = Date.now();
  let lastTime = null;
  let hourInMillis = 3600 * 1000;
  let userBurnRateMilligrams = user.weight / 10.0 * 1000;
  for(var i in drinks) {
    let drink = drinks[i];
    let drinkTime = Date.parse(drink.created);
    milligrams += drink.alcohol;
    if(lastTime) {
      let diff = drinkTime - lastTime;
      let diffInHours = diff / hourInMillis;
      milligrams -= userBurnRateMilligrams * diffInHours;
    }
    lastTime = drinkTime;
  }
  let diff = now - lastTime;
  let diffInHours = diff / hourInMillis;
  milligrams -= userBurnRateMilligrams * diffInHours;
  return milligrams > 0 ? milligrams : 0;
}

cmd.register('/annokset', cmd.TYPE_ALL, function(msg, words){
  findUser(msg)
  .then(function(user){
    users.getBooze(user)
    .then(function(drinks){
      let grams = sumGrams(drinks) / 1000.0;
      utils.sendPrivateMsg(msg, 'Olet aikojen saatossa tuhonnut ' + grams + ' grammaa alkoholia, joka vastaa ' + (grams / 12.2).toFixed(2) + ' annosta.');
    }, function(err){
      utils.sendPrivateMsg(msg, err);
    });
  }, function(err){
    utils.sendPrivateMsg(msg, err);
  });
}, '/annokset - listaa kaikki annokset.');

cmd.register('/polttamatta', cmd.TYPE_ALL, function(msg, words){
  findUser(msg)
  .then(function(user){
    users.getBooze(user)
    .then(function(drinks){
      try {
        let grams = sumGramsUnBurned(user, drinks) / 1000.0;
        utils.sendPrivateMsg(msg, 'Sinussa on jäljellä ' + grams + ' grammaa alkoholia, joka vastaa ' + (grams / 12.2).toFixed(2) + ' annosta.');
      } catch (err) {
        console.error(err);
        utils.sendPrivateMsg(msg, err);
      }

    }, function(err){
      console.error(err);
      utils.sendPrivateMsg(msg, err);
    });
  }, function(err){
    console.error(err);
    utils.sendPrivateMsg(msg, err);
  });
}, '/polttamatta - listaa kuinka paljon alkoholia sinulla on polttamatta.');

cmd.register('/promillet', cmd.TYPE_ALL, function(msg, words){
  if(msg.chat.type === 'private'){
    findUser(msg)
    .then(function(user){
      users.getBooze(user)
      .then(function(drinks){
        try {
          let grams = sumGramsUnBurned(user, drinks) / 1000.0;
          let liquid = user.weight * LIQUID_PERCENT[user.gender] * 1000;
          utils.sendPrivateMsg(msg, (grams / liquid*1000).toFixed(2) + '‰');
        } catch (err) {
          console.error(err);
          utils.sendPrivateMsg(msg, err);
        }
      }, function(err){
        utils.sendPrivateMsg(msg, err);
      });
    }, function(err){
      utils.sendPrivateMsg(msg, err);
    });
  } else {
  }
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

cmd.register('/otinko', cmd.TYPE_PRIVATE, function(msg, words){
  findUser(msg)
  .then(function(user){
    users.getBoozeForLast48h(user)
    .then(function(drinks){
      try {
        let drinkList = makeDrinksString(drinks);
        utils.sendPrivateMsg(msg, drinkList);
      } catch (err) {
        console.error(err);
        utils.sendPrivateMsg(msg, err);
      }
    }, function(err){
      console.error(err);
      utils.sendPrivateMsg(msg, err);
    });
  }, function(err){
    console.error(err);
    utils.sendPrivateMsg(msg, err);
  });
}, '/otinko - näyttää otitko ja kuinka monta viime yönä.');

cmd.register('/moro', cmd.TYPE_ALL, function(msg, words){
  if(msg.chat.type !== 'group'){
    throw 'Käytä tätä komentoa ryhmässä!';
  }
  findUser(msg)
  .then(function(user){
    users.joinGroup(user, msg)
    .then(function(){
      utils.sendMsg(msg, 'Rippaa rauhassa kera ' + msg.chat.title + ' -kavereiden.');
    }, function(err){
      console.error(err);
      utils.sendMsg(msg, 'Virhe!');
    });
  }, function(err){
    console.error(err);
    utils.sendMsg(msg, 'Virhe!');
  });
}, '/moro - Lisää sinut ryhmään mukaan.');
