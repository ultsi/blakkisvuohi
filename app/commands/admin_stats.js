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
    /loglevel
    Allows the admin to set the loglevel
*/
'use strict';
const when = require('when');
const log = require('loglevel');
const Commands = require('../lib/commands.js');
const stats = require('../db/stats.js');

function printStats(context, user, msg, words)  {
    let deferred = when.defer();
    
    stats.get()
    .then((res) => {
        let top10text = res.top10UserStats.map((stats) => stats.nick + ' - ' + stats.count).join('\n');
        context.privateReply('Tilastoja:\nKäyttäjiä on yhteensä ' + res.usersCount + 'kpl, joista 14pv sisällä aktiivisia ' + res.activeUsers14DaysCount + ', ja 7pv sisällä aktiivisia ' + res.activeUsers7DaysCount + '.\nRyhmiä on yhteensä ' + res.groupsCount + 'kpl, joista 14pv sisällä aktiivisia ' + res.activeGroups14DaysCount + ', ja 7pv sisällä aktiivisia ' + res.activeGroups7DaysCount + '.\nTop10 tilastot:\n\n' + top10text);
        deferred.resolve();
    }, (err) => {
        log.error(err);
        context.privateReply('Virhe!');
        deferred.resolve();
    });

    return deferred.promise;
}

Commands.registerAdminCommand(
    '/stats',
    '/stats - listaa botin statsit',
    Commands.TYPE_PRIVATE, [printStats]
);