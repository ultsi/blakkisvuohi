/*
    Bläkkisvuohi, a Telegram bot to help track estimated blood alcohol concentration.
    Copyright (C) 2017  Joonas Ulmanen

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

/*
    /annokset
    In chat:
        Prints a sorted list of users' unburned alcohol in standard drinks
    In private:
        Returns information about current alcohol levels
*/
'use strict'

import * as constants from '../constants'
import * as groups from '../db/groups'
import * as alcomath from '../lib/alcomath'
import * as Commands from '../lib/commands'
import * as utils from '../lib/utils'
import * as strings from '../strings'

function makeDrinksString(drinks) {
    const list = []
    let day = null
    for (const drink of drinks) {
        const drinkTime = new Date(Date.parse(drink.created))
        const drinkShortDate = drinkTime.getDate() + '.' + (drinkTime.getMonth() + 1) + '.'
        if (day !== drinkShortDate) {
            day = drinkShortDate
            list.push(day)
        }
        let drinkHours = drinkTime.getHours() + ''
        if (drinkHours.length === 1) {
            drinkHours = '0' + drinkHours
        }
        let drinkMinutes = drinkTime.getMinutes() + ''
        if (drinkMinutes.length === 1) {
            drinkMinutes = '0' + drinkMinutes
        }
        list.push(drinkHours + ':' + drinkMinutes + ' ' + drink.description)
    }
    return list.join('\n')
}

function annokset(context, msg, user) {
    context.end()
    if (msg.chat.type === 'private') {
        return Promise.all([
            user.getBooze(),
            user.getBoozeForLastHours(72),
        ]).then((res) => {
            const drinks = res[0],
                drinks72h = res[1]
            let ebac = alcomath.calculateEBACFromDrinks(user, drinks)
            let permilles = ebac.permilles
            let permilles30Min = ebac.permilles30Min
            let grams = ebac.grams
            let metabolismRate = alcomath.getUserMetabolismRate()
            let time = permilles30Min / metabolismRate
            time = time > 0 ? time + 0.5 : time
            let hours = Math.floor(time)
            const text = strings.long_permilles_text.format({
                permilles: utils.roundTo(permilles, 2),
                permilles30Min: utils.roundTo(permilles30Min, 2),
                grams: utils.roundTo(grams, 0),
                standard_drinks: utils.roundTo(grams / constants.STANDARD_DRINK_GRAMS, 2),
                hours: hours,
                minutes: ('0' + Math.ceil((time - hours) * 60)).slice(-2),
                drinkList72h: makeDrinksString(drinks72h)
            })
            return context.privateReply(text)
        })
    } else {
        let group = new groups.Group(msg.chat.id)
        return group.getStandardDrinksListing()
            .then((standardDrinksListing) => {
                const listText = standardDrinksListing.map(user => strings.commands.annokset.text_group_list_item.format({
                    username: user[0],
                    standard_drinks: utils.roundTo(user[1], 2),
                    drinks12h: utils.roundTo(user[2], 2),
                    drinks24h: utils.roundTo(user[3], 2)
                }))
                const text = strings.commands.annokset.text_group.format({
                    chat_title: msg.chat.title,
                    list: listText
                })
                return context.chatReply(text)
            })
    }
}

Commands.register(
    '/annokset',
    strings.commands.annokset.cmd_description,
    Commands.SCOPE_ALL,
    Commands.PRIVILEGE_USER,
    Commands.TYPE_SINGLE,
    annokset,
)