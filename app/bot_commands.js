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

'use strict';

const Commands = require('./lib/commands.js');
const utils = require('./lib/utils.js');
const users = require('./db/users.js');
const groups = require('./db/groups.js');
const when = require('when');
const alcomath = require('./alcomath.js');
const constants = require('./constants.js');
const blakkisChart = require('./blakkischart.js');

const DRINK_RESPONSES = ['Bäää.', 'Uuteen nousuun.', 'Muista juoda vettä!', 'Aamu alkaa A:lla.',
    'Muista juoda vettä!', 'Juo viinaa, viina on hyvää.', 'Meno on meno.',
    'Lörs lärä, viinaa!', 'Muista juoda vettä!'
];

function getRandomResponse() {
    return DRINK_RESPONSES[Math.floor(Math.random() * DRINK_RESPONSES.length)];
}

/*
    /luotunnus
    3 phased command where the user can sign up to use the bot's functionality
    Asks for weight and gender for future calculations
*/

function signupPhase1(context, msg, words) {
    let username = msg.from.username;
    if (!username) {
        username = msg.from.first_name;
        if (msg.from.last_name) {
            username = username + ' ' + msg.from.last_name;
        }
    }
    context.storeVariable('username', username);
    context.storeVariable('userId', msg.from.id);
    context.nextPhase();
    return context.privateReply('Tervetuloa uuden tunnuksen luontiin ' + username + '. Alkoholilaskuria varten tarvitsen tiedot painosta ja sukupuolesta.\n\nSyötä ensimmäiseksi paino kilogrammoissa ja kokonaislukuna:');
}

function signupPhase2(context, msg, words) {
    if (!utils.isValidInt(words[0])) {
        return context.privateReply('Paino ei ole kokonaisluku');
    }

    let weight = parseInt(words[0], 10);
    if (weight < 30 || weight > 200) {
        return context.privateReply('Painon ala- ja ylärajat ovat 30kg ja 200kg.');
    }

    context.storeVariable('weight', weight);
    context.nextPhase();
    return context.privateReplyWithKeyboard('Paino tallennettu. Syötä seuraavaksi sukupuoli:', [
        ['mies', 'nainen']
    ]);
}

function signupPhase3(context, msg, words) {
    if (words[0] !== 'nainen' && words[0] !== 'mies') {
        return context.privateReplyWithKeyboard('Syötä joko nainen tai mies', [
            ['mies', 'nainen']
        ]);
    }

    const userId = context.fetchVariable('userId');
    const username = context.fetchVariable('username');
    const weight = context.fetchVariable('weight');
    const gender = words[0];
    context.end();

    let deferred = when.defer();
    users.new(userId, username, weight, gender)
        .then((user) => {
            deferred.resolve(context.privateReply('Moikka ' + username + '! Tunnuksesi luotiin onnistuneesti. Muista, että antamani luvut alkoholista ovat vain arvioita, eikä niihin voi täysin luottaa. Ja eikun juomaan!'));
        }, (err) => {
            console.log(err);
            deferred.reject('Isompi ongelma, ota yhteyttä adminiin.');
        });
    return deferred.promise;
}

Commands.register('/luotunnus', '/luotunnus - Luo itsellesi tunnus botin käyttöä varten.', Commands.TYPE_PRIVATE, [signupPhase1, signupPhase2, signupPhase3]);

function whoAmI(context, user, msg, words) {
    return context.privateReply('Käyttäjä ' + user.username + ', id: ' + user.userId + ', paino: ' + user.weight + ', sukupuoli: ' + user.gender);
}

Commands.registerUserCommand('/whoami', '/whoami - tulosta omat tietosi.', Commands.TYPE_PRIVATE, [whoAmI]);


function getPermillesTextForGroup(groupId) {
    let deferred = when.defer();
    let group = new groups.Group(groupId);
    when.all([
        group.getDrinkTimes(),
        group.getDrinkSumsByUser(12),
        group.getDrinkSumsByUser(24)
    ]).spread((drinksByUser, drinkSumsByUser12h, drinkSumsByUser24h) => {
        try  {
            let permilles = [];
            for (var userId in drinksByUser) {
                let details = drinksByUser[userId];
                let user = new users.User(details.userid, details.nick, details.weight, details.gender);
                let userPermilles = alcomath.getPermillesFromDrinks(user, details.drinks);
                if (userPermilles > 0) {
                    let sum12h = drinkSumsByUser12h[details.userid] && drinkSumsByUser12h[details.userid].sum || 0;
                    let sum24h = drinkSumsByUser24h[details.userid] && drinkSumsByUser24h[details.userid].sum || 0;
                    permilles.push([user.username, userPermilles, sum12h / constants.KALJA033, sum24h / constants.KALJA033]);
                }
            }
            permilles = permilles.sort((a, b) => {
                return b[1] - a[1];
            });
            permilles = permilles.map(user => user[0] + '... ' + user[1].toFixed(2) + '‰ (' + user[2].toFixed(1) + '/' + user[3].toFixed(1) + ')');
            deferred.resolve('Käyttäjä...‰ (annoksia 12h/24h)\n\n' + permilles.join('\n'));
        } catch (err)  {
            console.error(err);
            deferred.reject('Isompi ongelma, ota yhteyttä adminiin.');
        }
    }, (err) => {
        console.error(err);
        deferred.reject('Isompi ongelma, ota yhteyttä adminiin.');
    });
    return deferred.promise;
}

function getDrinksTextForGroup(groupId) {
    let deferred = when.defer();
    let group = new groups.Group(groupId);
    when.all([
        group.getDrinkTimes(),
        group.getDrinkSumsByUser(12),
        group.getDrinkSumsByUser(24)
    ]).spread((drinksByUser, drinkSumsByUser12h, drinkSumsByUser24h) => {
        try  {
            let drinks = [];
            for (var userId in drinksByUser) {
                let details = drinksByUser[userId];
                let user = new users.User(details.userid, details.nick, details.weight, details.gender);
                let userDrinks = alcomath.sumGramsUnBurned(user, details.drinks);
                if (userDrinks > 0) {
                    let sum12h = drinkSumsByUser12h[details.userid] && drinkSumsByUser12h[details.userid].sum || 0;
                    let sum24h = drinkSumsByUser24h[details.userid] && drinkSumsByUser24h[details.userid].sum || 0;
                    drinks.push([user.username, userDrinks / constants.STANDARD_DRINK_GRAMS, sum12h / constants.KALJA033, sum24h / constants.KALJA033]);
                }
            }
            drinks = drinks.sort((a, b) => {
                return b[1] - a[1];
            });
            drinks = drinks.map(user => user[0] + '... ' + user[1].toFixed(2) + 'kpl (' + user[2].toFixed(1) + '/' + user[3].toFixed(1) + ')');
            deferred.resolve('Käyttäjä... annoksia (yht 12h/24h)\n\n' + drinks.join('\n'));
        } catch (err)  {
            console.error(err);
            deferred.reject('Isompi ongelma, ota yhteyttä adminiin.');
        }
    }, (err) => {
        console.error(err);
        deferred.reject('Isompi ongelma, ota yhteyttä adminiin.');
    });
    return deferred.promise;
}

function drinkBoozeReturnPermilles(user, amount, description, msg) {
    let deferred = when.defer();

    user.drinkBooze(amount, description)
        .then((amount) => {
            user.getBooze()
                .then((drinks) => {
                    let permilles = alcomath.getPermillesFromDrinks(user, drinks);
                    deferred.resolve(permilles);
                }, (err) => {
                    console.log(err);
                    deferred.reject(err);
                });
        }, (err) => {
            console.error(err);
            deferred.reject('Isompi ongelma, ota yhteyttä adminiin.');
        });
    return deferred.promise;
}

/*
    /juoma command. Multiple phase command with lots of options
*/

let drinkCommand = {};
drinkCommand.toStartText = 'Alkuun';
drinkCommand.startKeyboard = [
    ['Miedot', 'Tiukat', 'Oma']
];
drinkCommand.miedotReply = {
    text: 'Valitse mieto',
    keyboard: [
        [constants.milds.beercan.print, constants.milds.beer4.print, constants.milds.beer05.print],
        [constants.milds.beer04.print, constants.milds.beerpint.print, constants.milds.lonkero.print],
        [constants.milds.wine12.print, constants.milds.wine16.print, drinkCommand.toStartText]
    ]
};

drinkCommand.tiukatReply = {
    text: 'Valitse tiukka',
    keyboard: [
        [constants.booze.mild.print, constants.booze.medium.print, constants.booze.basic.print, drinkCommand.toStartText]
    ]
};

drinkCommand[0] = function(context, user, msg, words) {
    context.nextPhase();
    return context.privateReplyWithKeyboard('Valitse juoman kategoria', drinkCommand.startKeyboard);
};

drinkCommand[1] = function(context, user, msg, words) {
    if (words[0].toLowerCase() === 'miedot') {
        context.toPhase('miedot');
        return context.privateReplyWithKeyboard(drinkCommand.miedotReply.text, drinkCommand.miedotReply.keyboard);
    } else if (words[0].toLowerCase() === 'tiukat') {
        context.toPhase('tiukat');
        return context.privateReplyWithKeyboard(drinkCommand.tiukatReply.text, drinkCommand.tiukatReply.keyboard);
    } else if (words[0].toLowerCase() === 'oma') {
        context.toPhase('omajuoma');
        return context.privateReplyWithKeyboard('Syötä juoman tilavuusprosentti, esim: 12.5.');
    } else {
        return context.privateReplyWithKeyboard('Väärä valinta, valitse juoman kategoria', drinkCommand.startKeyboard);
    }
};

drinkCommand.miedot = function(context, user, msg, words) {
    if (msg.text.toLowerCase() === drinkCommand.toStartText.toLowerCase()) {
        context.toPhase(1);
        return context.privateReplyWithKeyboard('Valitse juoman kategoria', drinkCommand.startKeyboard);
    }
    const milds = constants.milds;
    let found = null;
    for (let key in milds) {
        if (milds[key].print.toLowerCase() === msg.text.toLowerCase()) {
            found = milds[key];
        }
    }

    if (!found) {
        return context.privateReplyWithKeyboard(drinkCommand.miedotReply.text, drinkCommand.miedotReply.keyboard);
    }
    let deferred = when.defer();
    drinkBoozeReturnPermilles(user, found.mg, found.print, msg)
        .then((permilles) => {
            deferred.resolve(context.privateReply(getRandomResponse() + ' ' + permilles.toFixed(2) + '‰'));
        }, (err) => {
            console.error(err.stack);
            deferred.reject('Isompi ongelma, ota yhteyttä adminiin.');
        });
    context.end();
    return deferred.promise;
};

drinkCommand.tiukat = function(context, user, msg, words) {
    if (msg.text.toLowerCase() === drinkCommand.toStartText.toLowerCase()) {
        context.toPhase(1);
        return context.privateReplyWithKeyboard('Valitse juoman kategoria', drinkCommand.startKeyboard);
    }
    const booze = constants.booze;
    let found = null;
    for (let key in booze) {
        if (booze[key].print.toLowerCase() === msg.text.toLowerCase()) {
            found = booze[key];
        }
    }

    if (!found) {
        return context.privateReplyWithKeyboard(drinkCommand.tiukatReply.text, drinkCommand.tiukatReply.keyboard);
    }
    let deferred = when.defer();
    drinkBoozeReturnPermilles(user, found.mg, found.print, msg)
        .then((permilles) => {
            deferred.resolve(context.privateReply(getRandomResponse() + ' ' + permilles.toFixed(2) + '‰'));
        }, (err) => {
            console.error(err.stack);
            deferred.reject('Isompi ongelma, ota yhteyttä adminiin.');
        });
    context.end();
    return deferred.promise;
};

drinkCommand.omajuoma = function(context, user, msg, words) {
    let vol = parseFloat(words[0]);
    if (!utils.isValidFloat(vol)) {
        return context.privateReply('Prosentti on väärin kirjoitettu. Älä käytä pilkkua.');
    } else if (vol <= 0) {
        return context.privateReply('Alle 0-prosenttista viinaa ei kelloteta. Hölmö.');
    } else if (vol > 100) {
        return context.privateReply('Yli 100-prosenttista viinaa ei kelloteta. Hölmö.');
    }

    context.storeVariable('vol', vol);
    context.toPhase('omajuomaEnd');
    return context.privateReply('Hyvä, seuraavaksi syötä viinan määrä senttilitroissa.');
};

drinkCommand.omajuomaEnd = function(context, user, msg, words) {
    let centiliters = parseInt(words[0]);
    if (!utils.isValidInt(centiliters)) {
        return context.privateReply('Kirjoita määrä senttilitroissa numerona.');
    } else if (centiliters < 1) {
        return context.privateReply('Alle 1 senttilitraa on liian vähän.');
    } else if (centiliters >= 250) {
        return context.privateReply('Yli 2.5 litraa viinaa? Ei käy.');
    }

    // Everything ok, use the variables
    let vol = context.fetchVariable('vol');
    let mg = constants.calcAlcoholMilligrams(vol / 100.0, centiliters / 100.0);
    let deferred = when.defer();
    drinkBoozeReturnPermilles(user, mg, 'Oma juoma - ' + centiliters + 'cl ' + vol + '%', msg)
        .then((permilles) => {
            deferred.resolve(context.privateReply(getRandomResponse() + ' ' + permilles.toFixed(2) + '‰'));
        }, (err) => {
            console.error(err.stack);
            deferred.reject('Isompi ongelma, ota yhteyttä adminiin.');
        });
    context.end();
    return deferred.promise;
};

Commands.registerUserCommand('/juoma', '/juoma - lisää yksi juoma tilastoihin', Commands.TYPE_PRIVATE, drinkCommand);

function kaljaCommand(context, user, msg, words) {
    let deferred = when.defer();
    drinkBoozeReturnPermilles(user, constants.KALJA033, '/kalja033', msg)
        .then((permilles) => {
            deferred.resolve(context.privateReply(getRandomResponse() + ' ' + permilles.toFixed(2) + '‰'));
        }, (err) => {
            console.error(err.stack);
            deferred.reject('Isompi ongelma, ota yhteyttä adminiin.');
        });
    context.end();
    return deferred.promise;
}

Commands.registerUserCommand('/kalja033', '/kalja033 - pikanäppäin yhdelle kappaleelle olutta. Ammattilaiskäyttöön.', Commands.TYPE_PRIVATE, [kaljaCommand]);

function kalja05Command(context, user, msg, words) {
    let deferred = when.defer();
    drinkBoozeReturnPermilles(user, constants.KALJA05, '/kalja05', msg)
        .then((permilles) => {
            deferred.resolve(context.privateReply(getRandomResponse() + ' ' + permilles.toFixed(2) + '‰'));
        }, (err) => {
            console.error(err.stack);
            deferred.reject('Isompi ongelma, ota yhteyttä adminiin.');
        });
    context.end();
    return deferred.promise;
}

Commands.registerUserCommand('/kalja05', '/kalja05 - pikanäppäin yhdelle kappaleelle 0.5l olutta. Ammattilaiskäyttöön.', Commands.TYPE_PRIVATE, [kalja05Command]);

function kulutus(context, user, msg, words) {
    let deferred = when.defer();
    let hours = (words[1] && parseInt(words[1])) ? parseInt(words[1]) * 24 : 4 * 365 * 24;
    if (context.isPrivateChat()) {
        user.getDrinkSumForXHours(hours)
            .then((res) => {
                let sum = res.sum;
                let created = new Date(res.created);
                let oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
                let daysBetween = (words[1] && parseInt(words[1])) ? parseInt(words[1]) : Math.round((new Date().getTime() - created.getTime()) / oneDay);
                let grams = sum / 1000.0;
                deferred.resolve(context.privateReply('Olet ' + daysBetween + ' päivän aikana tuhonnut ' + Math.round(grams) + ' grammaa alkoholia, joka vastaa ' + Math.round(grams / 12.2) + ' annosta. Keskimäärin olet juonut ' + Math.round((grams / daysBetween / 12.2)) + ' annosta per päivä. Hienosti.'));
            }, (err) => {
                console.error(err);
                deferred.reject('Isompi ongelma, ota yhteyttä adminiin.');
            });
    } else {
        let group = new groups.Group(msg.chat.id);
        group.getDrinkSumForXHours(hours)
            .then((res) => {
                let sum = res.sum;
                let created = new Date(res.created);
                let oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
                let daysBetween = (words[1] && parseInt(words[1])) ? parseInt(words[1]) : Math.round((new Date().getTime() - created.getTime()) / oneDay);
                let grams = sum / 1000.0;
                deferred.resolve(context.chatReply('Ryhmän jäsenet ovat ' + daysBetween + ' päivän aikana tuhonneet ' + Math.round(grams) + ' grammaa alkoholia, joka vastaa ' + Math.round(grams / 12.2) + ' annosta. Keskimäärin on juotu ' + Math.round((grams / daysBetween / 12.2)) + ' annosta per päivä. Hienosti.'));
            }, (err) => {
                console.error(err);
                deferred.reject(err);
            });
    }
    context.end();
    return deferred.promise;
}

Commands.registerUserCommand('/kulutus', '/kulutus <päivissä> - listaa kulutus. Voit myös antaa päivät parametrina, jolloin näet kulutuksen viime päiviltä.', Commands.TYPE_ALL, [kulutus]);

function annokset(context, user, msg, words) {
    let deferred = when.defer();
    if (msg.chat.type === 'private') {
        user.getBooze()
            .then((drinks) => {
                try {
                    let permilles = alcomath.getPermillesFromDrinks(user, drinks);
                    let grams = alcomath.sumGramsUnBurned(user, drinks);
                    let burnRate = alcomath.getUserBurnRate(user);
                    let time = grams / burnRate;
                    let hours = Math.floor(time);
                    let minutes = ('0' + Math.ceil((time - hours) * 60)).slice(-2);
                    deferred.resolve(context.privateReply('Olet ' + permilles.toFixed(2) + '‰ humalassa. Veressäsi on ' + grams.toFixed(2) + ' grammaa alkoholia, joka vastaa ' + (grams / 12.2).toFixed(2) + ' annosta. Olet selvinpäin ' + hours + 'h' + minutes + 'min päästä.'));
                } catch (err) {
                    console.error(err);
                    deferred.reject('Isompi ongelma, ota yhteyttä adminiin.');
                }
            }, (err) => {
                console.error(err);
                deferred.reject('Isompi ongelma, ota yhteyttä adminiin.');
            });
    } else {
        getDrinksTextForGroup(msg.chat.id)
            .then((text) => {
                text = msg.chat.title + ' -kavereiden rippitaso:\n' + text;
                deferred.resolve(context.chatReply(text));
            }, (err) => {
                deferred.reject(err);
            });
    }
    context.end();
    return deferred.promise;
}

Commands.registerUserCommand(
    '/annokset',
    '/annokset - kertoo ryhmän kulutetut annokset viimeisen 48h ajalta',
    Commands.TYPE_ALL, [annokset]
);

function listPermilles(context, user, msg, words) {
    let deferred = when.defer();
    if (msg.chat.type === 'private') {
        user.getBooze()
            .then((drinks) => {
                try {
                    let permilles = alcomath.getPermillesFromDrinks(user, drinks);
                    let grams = alcomath.sumGramsUnBurned(user, drinks);
                    let burnRate = alcomath.getUserBurnRate(user);
                    let time = grams / burnRate;
                    let hours = Math.floor(time);
                    let minutes = ('0' + Math.ceil((time - hours) * 60)).slice(-2);
                    deferred.resolve(context.privateReply('Olet ' + permilles.toFixed(2) + '‰ humalassa. Veressäsi on ' + grams.toFixed(2) + ' grammaa alkoholia, joka vastaa ' + (grams / 12.2).toFixed(2) + ' annosta. Olet selvinpäin ' + hours + 'h' + minutes + 'min päästä.'));
                } catch (err) {
                    console.error(err);
                    deferred.reject('Isompi ongelma, ota yhteyttä adminiin.');
                }
            }, (err) => {
                console.error(err);
                deferred.reject('Isompi ongelma, ota yhteyttä adminiin.');
            });
    } else {
        getPermillesTextForGroup(msg.chat.id)
            .then((text) => {
                text = msg.chat.title + ' -kavereiden rippitaso:\n' + text;
                deferred.resolve(context.chatReply(text));
            }, (err) => {
                deferred.reject(err);
            });
    }
    context.end();
    return deferred.promise;
}

Commands.registerUserCommand('/promillet', '/promillet - listaa kuinka paljon promilleja sinulla tai chatissa olevilla suunnilleen on.', Commands.TYPE_ALL, [listPermilles]);



function undoDrinkConfirmation(context, user, msg, words) {
    context.nextPhase();
    return context.privateReplyWithKeyboard('Olet laattaamassa viimeksi juodun juomasi. Oletko varma?', [
        ['Kyllä', 'En']
    ]);
}

function undoDrink(context, user, msg, words) {
    let deferred = when.defer();
    if (words[0].toLowerCase() === 'kyllä') {
        user.undoDrink()
            .then(() => {
                user.getBooze()
                    .then((drinks) => {
                        let permilles = alcomath.getPermillesFromDrinks(user, drinks);
                        deferred.resolve(context.privateReply('Laatta onnistui. Olet enää ' + permilles.toFixed(2) + '‰ humalassa.'));
                    }, (err) => {
                        console.log(err.stack);
                        deferred.reject(err);
                    });
            }, (err) => {
                console.log(err.stack);
                deferred.reject(err);
            });
    } else {
        deferred.resolve(context.privateReply('Laatta peruttu.'));
    }
    context.end();
    return deferred.promise;
}

Commands.registerUserCommand('/laatta', '/laatta - kumoaa edellisen lisätyn juoman', Commands.TYPE_PRIVATE, [undoDrinkConfirmation, undoDrink]);


function makeDrinksString(drinks) {
    let list = [];
    let day = null;
    for (var i in drinks) {
        let drink = drinks[i];
        let drinkTime = new Date(Date.parse(drink.created));
        let drinkShortDate = drinkTime.getDate() + '.' + (drinkTime.getMonth() + 1) + '.';
        if (day !== drinkShortDate)  {
            day = drinkShortDate;
            list.push(day);
        }
        let drinkHours = drinkTime.getHours() + '';
        if (drinkHours.length === 1) {
            drinkHours = '0' + drinkHours;
        }
        let drinkMinutes = drinkTime.getMinutes() + '';
        if (drinkMinutes.length === 1) {
            drinkMinutes = '0' + drinkMinutes;
        }
        list.push(drinkHours + ':' + drinkMinutes + ' ' + drink.description);
    }
    return list.join('\n');
}

function otinko(context, user, msg, words) {
    let deferred = when.defer();
    user.getBoozeForLastHours(48)
        .then((drinks) => {
            try {
                let drinkList = makeDrinksString(drinks);
                deferred.resolve(context.privateReply('Viimeisen kahden päivän häppeningit:\n' + drinkList));
            } catch (err) {
                console.error(err);
                deferred.reject('Isompi ongelma, ota yhteyttä adminiin.');
            }
        }, (err) => {
            console.error(err);
            deferred.reject('Isompi ongelma, ota yhteyttä adminiin.');
        });
    context.end();
    return deferred.promise;
}

Commands.registerUserCommand('/otinko', '/otinko - näyttää otitko ja kuinka monta viime yönä.', Commands.TYPE_PRIVATE, [otinko]);

function moro(context, user, msg, words)  {
    let deferred = when.defer();
    if (msg.chat.type === 'private') {
        deferred.reject('Käytä tätä komentoa ryhmässä!');
        return deferred.promise;
    }
    user.joinGroup(msg)
        .then(() => {
            deferred.resolve(context.chatReply('Rippaa rauhassa kera ' + msg.chat.title + ' -kavereiden.'));
        }, (err) => {
            console.log(err);
            deferred.resolve(context.chatReply('Rippaa rauhassa kera ' + msg.chat.title + ' -kavereiden.'));
        });
    context.end();
    return deferred.promise;
}

Commands.registerUserCommand('/moro', '/moro - Lisää sinut ryhmään mukaan.', Commands.TYPE_ALL, [moro]);


function randomColor() {
    var r = Math.round(Math.random() * 255);
    var g = Math.round(Math.random() * 255);
    var b = Math.round(Math.random() * 255);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
}

function kuvaaja(context, user, msg, words) {
    let deferred = when.defer();
    console.log('trying to form graph');

    let graphTitle = 'Promillekuvaaja feat. ' + msg.chat.title;

    let group = new groups.Group(msg.chat.id);
    group.getDrinkTimes(msg.chat.id)
        .then((drinksByUser) => {
            try  {
                let labels = [];
                let datasets = [];
                for (var userId in drinksByUser) {
                    let details = drinksByUser[userId];
                    let user = new users.User(details.userid, details.nick, details.weight, details.gender);
                    let dataByHour = alcomath.getPermillesAndGramsFromDrinksByHour(user, details.drinks);
                    let permilles = [];
                    for (var i in dataByHour.permillesByHour) {
                        if (labels.length < dataByHour.permillesByHour.length) {
                            labels.push(dataByHour.permillesByHour[i].hour);
                        }
                        permilles.push(dataByHour.permillesByHour[i].permilles);
                    }
                    console.log(dataByHour);
                    let color = randomColor();
                    datasets.push({
                        label: details.nick,
                        data: permilles,
                        fill: false,
                        backgroundColor: color,
                        borderColor: color
                    });
                }
                blakkisChart.getLineGraphBuffer({
                        labels: labels,
                        datasets: datasets
                    }, graphTitle)
                    .then((buffer) => {
                        console.log('got the line graph buffer');
                        console.log(buffer);
                        deferred.resolve(context.photoReply(buffer, graphTitle));
                    }, (err) => {
                        console.log(err);
                        deferred.resolve(context.chatReply('Kuvan muodostus epäonnistui!'));
                    });
            } catch (err)  {
                console.error(err);
                deferred.reject('Isompi ongelma, ota yhteyttä adminiin.');
            }
        }, (err) => {
            console.error(err);
            deferred.reject('Isompi ongelma, ota yhteyttä adminiin.');
        });

    context.end();
    return deferred.promise;
}

Commands.registerUserCommand('/kuvaaja', '/kuvaaja - Näyttää ryhmän 24h tapahtumat kuvaajana.', Commands.TYPE_ALL, [kuvaaja]);