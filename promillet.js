'use strict';

const Commands = require('./cmd.js');
const utils = require('./utils.js');
const users = require('./users.js');
const when = require('when');
const alcomath = require('./alcomath.js');
const alcoconstants = require('./alcoconstants.js');

const DRINK_RESPONSES = ['Bäää.', 'Uuteen nousuun.', 'Aamu alkaa A:lla.', 'Juo viinaa, viina on hyvää.', 'Meno on meno.', 'Lörs lärä, viinaa!'];

function getRandomResponse(){
  return DRINK_RESPONSES[Math.floor(Math.random()*DRINK_RESPONSES.length)];
}

/*
  /luotunnus
  3 phased command where the user can sign up for the bot's functionality
  Asks for weight and gender for future calculations
*/

function signupPhase1(context, msg, words) {
  let username = msg.from.username;
  if(!username){
    username = msg.from.first_name;
    if(msg.from.last_name){
      username = username + ' ' + msg.from.last_name;
    }
  }
  context.storeVariable('username', username);
  context.storeVariable('userId', msg.from.id);
  context.nextPhase();
  return context.privateReply('Tervetuloa uuden tunnuksen luontiin ' + username + '. Alkoholilaskuria varten tarvitsen tiedot painosta ja sukupuolesta.\n\nSyötä ensimmäiseksi paino kilogrammoissa ja kokonaislukuna:');
}

function signupPhase2(context, msg, words) {
  if(!utils.isValidInt(words[0])){
    return context.privateReply('Paino ei ole kokonaisluku');
  }

  let weight = parseInt(words[0], 10);
  if(weight < 30 || weight > 200){
    return context.privateReply('Painon ala- ja ylärajat ovat 30kg ja 200kg.')
  }

  context.storeVariable('weight', weight);
  context.nextPhase();
  return context.privateReplyWithKeyboard('Paino tallennettu. Syötä seuraavaksi sukupuoli:', [['mies', 'nainen']]);
}

function signupPhase3(context, msg, words) {
  if(words[0] !== 'nainen' && words[0] !== 'mies'){
    return context.privateReplyWithKeyboard('Syötä joko nainen tai mies', [['mies', 'nainen']]);
  }

  const userId = context.fetchVariable('userId');
  const username = context.fetchVariable('username');
  const weight = context.fetchVariable('weight');
  const gender = words[0];
  context.end();

  let deferred = when.defer();
  users.new(userId, username, weight, gender)
  .then(function(user){
    deferred.resolve(context.privateReply('Moikka ' + username + '! Tunnuksesi luotiin onnistuneesti. Muista, että antamani luvut alkoholista ovat vain arvioita, eikä niihin voi täysin luottaa. Ja eikun juomaan!'));
  }, function(err){
    console.log(err);
    deferred.reject('Isompi ongelma, ota yhteyttä adminiin.');
  })
  return deferred.promise;
}

Commands.register('/luotunnus', '/luotunnus - Luo itsellesi tunnus botin käyttöä varten.', Commands.TYPE_PRIVATE, [signupPhase1, signupPhase2, signupPhase3]);

function whoAmI(context, user, msg, words){
  return context.privateReply('Käyttäjä ' + user.username + ', id: ' + user.userId + ', paino: ' + user.weight + ', sukupuoli: ' + user.gender);
}

Commands.registerUserCommand('/whoami', '/whoami - tulosta omat tietosi.', Commands.TYPE_PRIVATE, [whoAmI]);


function getPermillesTextForGroup(groupId){
  let deferred = when.defer();
  when.all([
    users.getBoozeForGroup(groupId),
    users.getDrinkSumFor12hForGroup(groupId),
    users.getDrinkSumFor24hForGroup(groupId)
  ]).spread(function(drinksByUser, drinkSumsByUser12h, drinkSumsByUser24h){
      try {
        let permilles = [];
        for(var userId in drinksByUser){
          let details = drinksByUser[userId];
          let user = new users.User(details.userid, details.nick, details.weight, details.gender);
          let userPermilles = alcomath.getPermillesFromDrinks(user, details.drinks);
          if(userPermilles > 0){
            let sum12h = drinkSumsByUser12h[details.userid] && drinkSumsByUser12h[details.userid].sum || 0;
            let sum24h = drinkSumsByUser24h[details.userid] && drinkSumsByUser24h[details.userid].sum || 0;
            permilles.push([user.username, userPermilles, sum12h / alcomath.KALJA033, sum24h / alcomath.KALJA033]);
          }
        }
        permilles = permilles.sort(function(a,b){return b[1]-a[1];});
        permilles = permilles.map(user => user[0] + '... ' + user[1].toFixed(2) + '‰ ('+user[2].toFixed(1)+'/'+user[3].toFixed(1)+')');
        deferred.resolve('Käyttäjä...‰ (annoksia 12h/24h)\n\n' + permilles.join('\n'));
      } catch (err) {
        console.error(err);
        deferred.reject('Isompi ongelma, ota yhteyttä adminiin.');
      }
  }, function(err) {
    console.error(err);
    deferred.reject('Isompi ongelma, ota yhteyttä adminiin.');
  });
  return deferred.promise;
}

function drinkBoozeReturnPermilles(user, amount, description, msg){
  let deferred = when.defer();
  when.all([
    user.drinkBooze(amount, description),
    user.getDrinkCountsByGroupsForUser()
  ]).spread(function(amount, drinkCountsByGroups){
      user.getBooze()
      .then(function(drinks){
        let permilles = alcomath.getPermillesFromDrinks(user, drinks);
        deferred.resolve(permilles);
      }, function(err) {
        console.log(err);
        deferred.reject(err);
      });
      // do announcements based on drink counts
      for(var i in drinkCountsByGroups){
        let drinkCount = drinkCountsByGroups[i];
        if(drinkCount.count % 1000 === 0){
          getPermillesTextForGroup(drinkCount.groupid)
            .then(function(text){
              msg.sendMsgTo(drinkCount.groupid, user.username + ' joi juuri ryhmän ' + drinkCount.count + '. juoman!\n\nRippiä:\n'+text)
                .then(function(){}, function(err){
                  console.error(err);
                });
            }, function(err){
              console.error(err);
            });
        }
      }
    }, function(err){
      console.error(err);
      deferred.reject('Isompi ongelma, ota yhteyttä adminiin.');
    });
  return deferred.promise;
}

/*
  /juoma command. Multiple phase command with lots of options
*/

let drinkCommand = {};
drinkCommand.miedotReply = {text: 'Valitse mieto', keyboard: [[alcoconstants.milds.beercan.print, alcoconstants.milds.beer4.print, alcoconstants.milds.beer05.print],
                                                             [alcoconstants.milds.beerpint.print, alcoconstants.milds.lonkero.print, alcoconstants.milds.wine12.print],
                                                             [alcoconstants.milds.wine16.print]] };

drinkCommand.tiukatReply = {text: 'Valitse tiukka', keyboard: [[alcoconstants.booze.mild.print, alcoconstants.booze.medium.print, alcoconstants.booze.basic.print]]};

drinkCommand[0] = function (context, user, msg, words) {
  context.nextPhase();
  return context.privateReplyWithKeyboard('Valitse juoman kategoria', [['Miedot', 'Tiukat', 'Oma']]);
};

drinkCommand[1] = function (context, user, msg, words) {
  if(words[0].toLowerCase() === 'miedot') {
    context.toPhase('miedot');
    return context.privateReplyWithKeyboard(drinkCommand.miedotReply.text, drinkCommand.miedotReply.keyboard);
  } else if(words[0].toLowerCase() === 'tiukat') {
    context.toPhase('tiukat');
    return context.privateReplyWithKeyboard(drinkCommand.tiukatReply.text, drinkCommand.tiukatReply.keyboard);
  } else if(words[0].toLowerCase() === 'oma') {
    context.toPhase('omajuoma');
    return context.privateReplyWithKeyboard('Syötä juoman tilavuusprosentti, esim: 12.5.');
  } else {
    return context.privateReplyWithKeyboard('Väärä valinta, valitse juoman kategoria', [['Miedot', 'Tiukat', 'Oma']]);
  }
};

drinkCommand.miedot = function (context, user, msg, words) {
  const milds = alcoconstants.milds;
  let found = null;
  for(let key in milds) {
    if(milds[key].print.toLowerCase() === msg.text.toLowerCase()){
      found = milds[key];
    }
  }

  if(!found){
    return context.privateReplyWithKeyboard(drinkCommand.miedotReply.text, drinkCommand.miedotReply.keyboard);
  }
  let deferred = when.defer();
  drinkBoozeReturnPermilles(user, found.mg, found.print, msg)
    .then(function(permilles){
      deferred.resolve(context.privateReply(getRandomResponse() + ' ' + permilles.toFixed(2) + '‰'));
    }, function(err){
      console.error(err.stack);
      deferred.reject('Isompi ongelma, ota yhteyttä adminiin.');
    });
  context.end();
  return deferred.promise;
};

drinkCommand.tiukat = function (context, user, msg, words) {
  const booze = alcoconstants.booze;
  let found = null;
  for(let key in booze) {
    if(booze[key].print.toLowerCase() === msg.text.toLowerCase()){
      found = booze[key];
    }
  }

  if(!found){
    return context.privateReplyWithKeyboard(drinkCommand.tiukatReply.text, drinkCommand.tiukatReply.keyboard);
  }
  let deferred = when.defer();
  drinkBoozeReturnPermilles(user, found.mg, found.print, msg)
    .then(function(permilles){
      deferred.resolve(context.privateReply(getRandomResponse() + ' ' + permilles.toFixed(2) + '‰'));
    }, function(err){
      console.error(err.stack);
      deferred.reject('Isompi ongelma, ota yhteyttä adminiin.');
    });
  context.end();
  return deferred.promise;
};

drinkCommand.omajuoma = function (context, user, msg, words) {
  let vol = parseFloat(words[0]);
  if(!utils.isValidFloat(vol)){
    return context.privateReply('Prosentti on väärin kirjoitettu. Älä käytä pilkkua.');
  } else if(vol <= 0) {
    return context.privateReply('Alle 0-prosenttista viinaa ei kelloteta. Hölmö.');
  } else if(vol > 100) {
    return context.privateReply('Yli 100-prosenttista viinaa ei kelloteta. Hölmö.');
  }

  context.storeVariable('vol', vol);
  context.toPhase('omajuomaEnd')
  return context.privateReply('Hyvä, seuraavaksi syötä viinan määrä senttilitroissa.');
};

drinkCommand.omajuomaEnd = function(context, user, msg, words) {
  let centiliters = parseInt(words[0]);
  if(!utils.isValidInt(centiliters)){
    return context.privateReply('Kirjoita määrä senttilitroissa numerona.');
  } else if(centiliters < 1) {
    return context.privateReply('Alle 1 senttilitraa on liian vähän.');
  } else if(centiliters >= 250) {
    return context.privateReply('Yli 2.5 litraa viinaa? Ei käy.');
  }

  // Everything ok, use the variables
  let vol = context.fetchVariable('vol');
  let mg = alcomath.calcAlcoholMilliGrams(vol / 100.0, centiliters / 100.0);
  let deferred = when.defer();
  drinkBoozeReturnPermilles(user, mg, 'Oma juoma - ' + centiliters + 'cl ' + vol + '%', msg)
    .then(function(permilles){
      deferred.resolve(context.privateReply(getRandomResponse() + ' ' + permilles.toFixed(2) + '‰'));
    }, function(err){
      console.error(err.stack);
      deferred.reject('Isompi ongelma, ota yhteyttä adminiin.');
    });
  context.end();
  return deferred.promise;
};

Commands.registerUserCommand('/juoma', '/juoma - lisää yksi juoma tilastoihin', Commands.TYPE_PRIVATE, drinkCommand);

function annokset(context, user, msg, words) {
  let deferred = when.defer();
  user.getBooze()
    .then(function(drinks){
      let grams = alcomath.sumGrams(drinks);
      deferred.resolve(context.privateReply('Olet aikojen saatossa tuhonnut ' + grams.toFixed(2) + ' grammaa alkoholia, joka vastaa ' + (grams / 12.2).toFixed(2) + ' annosta.'));
    }, function(err){
      console.error(err);
      deferred.reject('Isompi ongelma, ota yhteyttä adminiin.');
    });
  context.end();
  return deferred.promise;
}

Commands.registerUserCommand('/annokset', '/annokset - listaa kaikki annokset.', Commands.TYPE_PRIVATE, [annokset]);

function listPermilles(context, user, msg, words) {
  let deferred = when.defer();
  if(msg.chat.type === 'private'){
    user.getBooze()
      .then(function(drinks){
        try {
          let permilles = alcomath.getPermillesFromDrinks(user, drinks);
          let grams = alcomath.sumGramsUnBurned(user, drinks);
          let burnRate = alcomath.getUserBurnRate(user);
          let time = grams / burnRate;
          let hours = Math.floor(time);
          let minutes = ('0' + Math.ceil((time - hours) * 60)).slice(-2);
          deferred.resolve(context.privateReply('Olet '+ permilles.toFixed(2) + '‰ humalassa. Veressäsi on ' + grams.toFixed(2) + ' grammaa alkoholia, joka vastaa ' + (grams / 12.2).toFixed(2) + ' annosta. Olet selvinpäin ' + hours + 'h'+minutes+'min päästä.'));
        } catch (err) {
          console.error(err);
          deferred.reject('Isompi ongelma, ota yhteyttä adminiin.');
        }
      }, function(err){
        console.error(err);
        deferred.reject('Isompi ongelma, ota yhteyttä adminiin.');
      });
  } else {
    getPermillesTextForGroup(msg.chat.id)
      .then(function(text){
        text = msg.chat.title + ' -kavereiden rippitaso:\n' + text;
        deferred.resolve(context.chatReply(text));
      }, function(err){
        deferred.reject(err);
      });
  }
  context.end();
  return deferred.promise;
}

Commands.registerUserCommand('/promillet', '/promillet - listaa kuinka paljon promilleja sinulla tai chatissa olevilla suunnilleen on.', Commands.TYPE_ALL, [listPermilles]);
/*
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
    list.push(drinkTime.getHours() + ':' + drinkTime.getMinutes() + ' ' + drink.description);
  }
  return list.join('\n');
}

Commands.registerUserCommand('/otinko', Commands.TYPE_PRIVATE, function(msg, words, user){
  let deferred = when.defer();
  users.getBoozeForLast48h(user)
    .then(function(drinks){
      try {
        let drinkList = makeDrinksString(drinks);
        deferred.resolve(Commands.privateResponse(drinkList));
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

Commands.registerUserCommand('/moro', Commands.TYPE_ALL, function(msg, words, user){
  let deferred = when.defer();
  if(msg.chat.type === 'private'){
    deferred.reject('Käytä tätä komentoa ryhmässä!');
    return deferred.promise;
  }
  users.joinGroup(user, msg)
    .then(function(){
      deferred.resolve(Commands.chatResponse('Rippaa rauhassa kera ' + msg.chat.title + ' -kavereiden.'));
    }, function(err){
      console.error(err);
      deferred.resolve(Commands.chatResponse('Rippaa rauhassa kera ' + msg.chat.title + ' -kavereiden.'));
    });
  return deferred.promise;
}, '/moro - Lisää sinut ryhmään mukaan.');
*/
