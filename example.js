
/*
  Example of phased cmds
*/
'use strict';
const Commands = require('./cmd.js');
const utils = require('./utils.js');

// First phase, just tell what to do
let viinaPhase1 = function(context, msg, words) {
  context.forgetVariables();
  context.nextPhase();
  return context.privateReply('Ai viinaa vai? Syötä juoman tilavuusprosentti, esim: 12.5.');
};

let viinaPhase2 = function(context, msg, words) {
  let vol = parseFloat(words[0]);
  if(!utils.isValidFloat(vol)){
    return context.privateReply('Prosentti on väärin kirjoitettu. Älä käytä pilkkua.');
  } else if(vol <= 0) {
    return context.privateReply('Alle 0-prosenttista viinaa ei kelloteta. Hölmö.');
  } else if(vol > 100) {
    return context.privateReply('Yli 100-prosenttista viinaa ei kelloteta. Hölmö.');
  }

  context.storeVariable('vol', vol);
  context.nextPhase();
  return context.privateReply('Hyvä, seuraavaksi syötä viinan määrä senttilitroissa.');
};

let viinaPhase3 = function(context, msg, words) {
  let centiliters = parseInt(words[0]);
  if(!utils.isValidNumber(centiliters)){
    return context.privateReply('Kirjoita määrä senttilitroissa numerona.');
  } else if(centiliters < 1) {
    return context.privateReply('Alle 1 senttilitraa on liian vähän.');
  } else if(centiliters >= 250) {
    return context.privateReply('Yli 2.5 litraa viinaa? Ei käy.');
  }

  // Everything ok, use the variables
  let vol = context.fetchVariable('vol');
  context.reset();
  // Here you would calculate stuff and store in database as usual
  return context.privateReply('Onnistui. Joit ' + centiliters + 'cl ' + vol + '% viinaa.');
};

Commands.registerUserCommand('/viina', 'Kellota viinaa prosenttien ja määrän mukaan.', Commands.TYPE_PRIVATE, [viinaPhase1, viinaPhase2, viinaPhase3]);
