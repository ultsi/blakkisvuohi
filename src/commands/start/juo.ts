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
    juo.js
    Juo menu command, uses inline version of commands.js
*/

'use strict'

import * as utils from '../../lib/utils'
import * as constants from '../../constants'
import * as strings from '../../strings'
const str_juo = strings.commands.start.juo
import * as alcomath from '../../lib/alcomath'

function makeDrinkOption(drink_amount, drink_name) {
    return {
        _userRequired: true,
        _onSelect: (user, msg) => {
            return user.drinkBoozeReturnEBAC(drink_amount, drink_name, msg)
                .then((ebac) => {
                    const permilles = ebac.permilles
                    const permilles30Min = ebac.permilles30Min
                    return str_juo.on_drink.format({
                        drink_response: utils.getRandomFromArray(strings.drink_responses),
                        short_permilles_text: strings.short_permilles_text.format({
                            permilles: utils.roundTo(permilles, 2),
                            permilles30Min: utils.roundTo(permilles30Min, 2)
                        })
                    })
                })
        }
    }
}

function makeDrinksListString(drinks) {
    let list = []
    for (var i in drinks) {
        let drink = drinks[i]
        let drinkTime = new Date(Date.parse(drink.created))
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

module.exports = {
    _onSelect: (context, user) => {
        return user.getLastNUniqueDrinks(2, str_juo.jalkikellotus.drink_name)
            .then((drinks) => {
                // this is needed for latest1&2 isAvailable calls
                context.storeVariable('juo_last2_drinks', drinks)
                return str_juo.on_select
            })
    },
    _userRequired: true,
    _headerTitle: str_juo.header_title,
    _formHeader: (user) => {
        return user.getEBACWithDrinksForLastHours(1)
            .then((res) => {
                const ebac = res.ebac,
                    last_drinks = res.last_drinks
                const drinks_text = last_drinks.length > 0 ? str_juo.header_drinks1h.format({
                    drinkList1h: makeDrinksListString(last_drinks)
                }) : ''
                return str_juo.header.format({
                    permilles: utils.roundTo(ebac.permilles, 2),
                    permilles30Min: utils.roundTo(ebac.permilles30Min, 2),
                    drink_list: drinks_text
                })
            })
    },
    [str_juo.miedot.button_text]: {
        _text: str_juo.miedot.on_select,
        _headerTitle: str_juo.miedot.header_title,
        _userRequired: true,
        [strings.emoji.beer + ' 33cl 4.7%']: makeDrinkOption(constants.calcAlcoholMilligrams(0.047, 0.33), strings.emoji.beer + ' 33cl 4.7%'),
        [strings.emoji.beer + ' 33cl 5.3%']: makeDrinkOption(constants.calcAlcoholMilligrams(0.053, 0.33), strings.emoji.beer + ' 33cl 5.3%'),
        [strings.emoji.beer + ' 40cl 4.7%']: makeDrinkOption(constants.calcAlcoholMilligrams(0.047, 0.40), strings.emoji.beer + ' 40cl 4.7%'),
        [strings.emoji.beer + ' 50cl 4.7%']: makeDrinkOption(constants.calcAlcoholMilligrams(0.047, 0.50), strings.emoji.beer + ' 50cl 4.7%'),
        [strings.emoji.beer + ' 56.8cl 4.7%']: makeDrinkOption(constants.calcAlcoholMilligrams(0.047, 0.568), strings.emoji.beer + ' 56.8cl 4.7%'),
        ['Lonkero 33cl 5.3%']: makeDrinkOption(constants.calcAlcoholMilligrams(0.053, 0.33), 'Lonkero 33cl 5.3%'),
        ['Siideri 33cl 4.7%']: makeDrinkOption(constants.calcAlcoholMilligrams(0.047, 0.33), 'Siideri 33cl 4.7%'),
    },
    [str_juo.viinit.button_text]: {
        _text: str_juo.viinit.on_select,
        _headerTitle: str_juo.viinit.header_title,
        _userRequired: true,
        [strings.emoji.wine + ' 12cl 12%']: makeDrinkOption(constants.calcAlcoholMilligrams(0.12, 0.12), strings.emoji.wine + ' 12cl 12%'),
        [strings.emoji.wine + ' 16cl 12%']: makeDrinkOption(constants.calcAlcoholMilligrams(0.16, 0.12), strings.emoji.wine + ' 16cl 12%'),
        [strings.emoji.drink + ' 20cl 12%']: makeDrinkOption(constants.calcAlcoholMilligrams(0.20, 0.12), strings.emoji.drink + ' 20cl 12%'),
        [strings.emoji.glasses + ' 12cl 11%']: makeDrinkOption(constants.calcAlcoholMilligrams(0.12, 0.11), strings.emoji.glasses + ' 12cl 11%')
    },
    [str_juo.shotit.button_text]: {
        _text: str_juo.shotit.on_select,
        _headerTitle: str_juo.shotit.header_title,
        _userRequired: true,
        [strings.emoji.shot + '4cl 20%']: makeDrinkOption(constants.calcAlcoholMilligrams(0.2, 0.04), strings.emoji.shot + '4cl 20%'),
        [strings.emoji.shot + '4cl 32%']: makeDrinkOption(constants.calcAlcoholMilligrams(0.32, 0.04), strings.emoji.shot + '4cl 32%'),
        [strings.emoji.shot + '4cl 38%']: makeDrinkOption(constants.calcAlcoholMilligrams(0.38, 0.04), strings.emoji.shot + '4cl 38%'),
        [strings.emoji.shot + '4cl 40%']: makeDrinkOption(constants.calcAlcoholMilligrams(0.40, 0.04), strings.emoji.shot + '4cl 40%'),
        [strings.emoji.shot + '4cl 60%']: makeDrinkOption(constants.calcAlcoholMilligrams(0.60, 0.04), strings.emoji.shot + '4cl 60%'),
    },
    [str_juo.oma.button_text]: {
        _text: str_juo.oma.on_select.format({
            help_example: str_juo.oma.help_example
        }),
        _headerTitle: str_juo.oma.header_title,
        _userRequired: true,
        _onText: (user, words) => {
            if (words.length !== 2) {
                return Promise.resolve(str_juo.oma.error_words.format({
                    help_example: str_juo.oma.help_example
                }))
            }
            const cl = words[0].replace('cl', ''),
                vol = words[1].replace('%', '')

            if (!utils.isValidFloat(cl)) {
                return Promise.resolve(str_juo.oma.error_cl.format({
                    help_example: str_juo.oma.help_example
                }))
            } else if (!utils.isValidFloat(vol)) {
                return Promise.resolve(str_juo.oma.error_vol.format({
                    help_example: str_juo.oma.help_example
                }))
            }

            const mg = constants.calcAlcoholMilligrams(vol / 100.0, cl / 100.0)

            if (alcomath.isAlcoholAmountOutOfLimits(mg)) {
                return Promise.resolve(str_juo.oma.error_exceeds)
            }

            return user.drinkBoozeReturnEBAC(mg, `Oma juoma - ${cl}cl ${vol}%`)
                .then((ebac) => {
                    const permilles = ebac.permilles
                    const permilles30Min = ebac.permilles30Min
                    return str_juo.on_drink.format({
                        drink_response: utils.getRandomFromArray(strings.drink_responses),
                        short_permilles_text: strings.short_permilles_text.format({
                            permilles: utils.roundTo(permilles, 2),
                            permilles30Min: utils.roundTo(permilles30Min, 2)
                        })
                    })
                })
        }
    },
    [str_juo.jalkikellotus.button_text]: {
        _userRequired: true,
        _text: str_juo.jalkikellotus.on_select,
        _headerTitle: str_juo.jalkikellotus.header_title,
        _onText: (context, words) => {
            const hours = context.fetchVariable('jalkikellotus_hours')
            const drinks = context.fetchVariable('jalkikellotus_drinks') || []

            if (!hours) {
                const inputHours = utils.parseFloat(words[0])
                if (!utils.isValidFloat(inputHours) || inputHours < 0 || inputHours > 24) {
                    return Promise.resolve(str_juo.jalkikellotus.hours_error)
                }

                context.storeVariable('jalkikellotus_hours', inputHours)
                return Promise.resolve(str_juo.jalkikellotus.input_drinks_start)
            }

            if (words.length < 2 || words.length % 2 !== 0) {
                return Promise.resolve(str_juo.jalkikellotus.input_drinks_words_error)
            }

            // validate each tuple
            for (let i = 0; i < words.length; i += 2) {
                const centiliters = utils.parseFloat(words[i].replace('cl', ''))
                const vol = utils.parseFloat(words[i + 1].replace('%', ''))
                if (!utils.isValidFloat(centiliters) || !utils.isValidFloat(vol) ||
                    centiliters < 0 || centiliters > 250 ||
                    vol < 0 || vol >= 100) {
                    return Promise.resolve(str_juo.jalkikellotus.input_drinks_drink_error.format({
                        drink: i / 2 + 1
                    }))
                }
                const mg = constants.calcAlcoholMilligrams(vol / 100.0, centiliters / 100.0)
                if (alcomath.isAlcoholAmountOutOfLimits(mg)) {
                    return Promise.resolve(str_juo.jalkikellotus.error_out_of_limits.format({
                        drink: i / 2 + 1
                    }))
                }
            }


            // Validated, save to drinks array
            const oldDrinksLength = drinks.length
            for (let i = 0; i < words.length; i += 2) {
                drinks.push({
                    name: str_juo.jalkikellotus.drink_name,
                    centiliters: utils.parseFloat(words[i]),
                    vol: utils.parseFloat(words[i + 1])
                })
            }
            context.storeVariable('jalkikellotus_drinks', drinks)

            return Promise.resolve(str_juo.jalkikellotus.input_drinks_drinks_correct.format({
                drinks_amount: drinks.length - oldDrinksLength,
                drinks_list: drinks.map(drink => drink.centiliters + 'cl ' + drink.vol + '%').join('\n')
            }))
        },
        [str_juo.jalkikellotus.save.button_text]: {
            _userRequired: true,
            _isAvailable: (context) => {
                return context.fetchVariable('jalkikellotus_drinks') &&
                    context.fetchVariable('jalkikellotus_drinks').length > 0
            },
            _onSelect: (context, user) => {
                const hours = context.fetchVariable('jalkikellotus_hours')
                const drinks = context.fetchVariable('jalkikellotus_drinks')
                    .map((d) => {
                        return {
                            text: d.name + ' ' + d.centiliters + 'cl ' + d.vol + '%',
                            mg: constants.calcAlcoholMilligrams(d.vol / 100, d.centiliters / 100)
                        }
                    })
                context.forgetVariable('jalkikellotus_hours')
                context.forgetVariable('jalkikellotus_drinks')
                return user.drinkBoozeLate(drinks, hours)
                    .then((ebac) => {
                        const permilles = ebac.permilles
                        const permilles30Min = ebac.permilles30Min
                        const short_permilles_text = strings.short_permilles_text.format({
                            permilles: utils.roundTo(permilles, 2),
                            permilles30Min: utils.roundTo(permilles30Min, 2)
                        })
                        return str_juo.jalkikellotus.save.on_select.format({
                            drink_response: utils.getRandomFromArray(strings.drink_responses),
                            drinks_amount: drinks.length,
                            short_permilles_text: short_permilles_text
                        })
                    })
            },
            _onExit: (context) => {
                context.forgetVariable('jalkikellotus_hours')
                context.forgetVariable('jalkikellotus_drinks')
            }
        },
        _onExit: (context, thisState, nextState) => {
            // dont forget when moving to saving phase
            if (nextState !== thisState.getChild(str_juo.jalkikellotus.save.button_text)) {
                context.forgetVariable('jalkikellotus_hours')
                context.forgetVariable('jalkikellotus_drinks')
            }
        }
    },
    [str_juo.kumoa.button_text]: {
        _headerTitle: str_juo.kumoa.header_title,
        _userRequired: true,
        _onSelect: (context, user) => {
            return user.getLastDrink()
                .then((drink) => {
                    if (drink) {
                        context.storeVariable('kumoa_drink', drink)
                        return str_juo.kumoa.on_select.format({
                            last_drink_name: drink.description,
                            last_drink_created: drink.created
                        })
                    } else {
                        return str_juo.kumoa.on_select_no_drinks
                    }
                })
        },
        _onExit: (context) => {
            context.forgetVariable('kumoa_drink')
        },
        [strings.yes]: {
            _userRequired: true,
            _isAvailable: (context) => {
                return context.fetchVariable('kumoa_drink') !== undefined
            },
            _onSelect: (user) => {
                return user.undoDrink()
                    .then(() => user.getBooze())
                    .then((drinks) => {
                        let ebac = alcomath.calculateEBACFromDrinks(user, drinks)
                        let permilles = ebac.permilles
                        let permilles30Min = ebac.permilles30Min
                        return str_juo.kumoa.success.format({
                            permilles: utils.roundTo(permilles, 2),
                            permilles30Min: utils.roundTo(permilles30Min, 2)
                        })
                    })
            }
        }
    },
    latest1: {
        _userRequired: true,
        _isAvailable: (context) => {
            const drinks = context.fetchVariable('juo_last2_drinks')
            return drinks && drinks.length >= 1
        },
        _getButtonText: (context) => {
            const drinks = context.fetchVariable('juo_last2_drinks')
            return drinks[0].description
        },
        _onSelect: (context, user) => {
            const drinks = context.fetchVariable('juo_last2_drinks')
            return user.drinkBoozeReturnEBAC(drinks[0].alcohol, drinks[0].description)
                .then((ebac) => {
                    const permilles = ebac.permilles
                    const permilles30Min = ebac.permilles30Min
                    return str_juo.on_drink.format({
                        drink_response: utils.getRandomFromArray(strings.drink_responses),
                        short_permilles_text: strings.short_permilles_text.format({
                            permilles: utils.roundTo(permilles, 2),
                            permilles30Min: utils.roundTo(permilles30Min, 2)
                        })
                    })
                })
        }
    },
    latest2: {
        _userRequired: true,
        _isAvailable: (context) => {
            const drinks = context.fetchVariable('juo_last2_drinks')
            return drinks && drinks.length >= 2
        },
        _getButtonText: (context) => {
            const drinks = context.fetchVariable('juo_last2_drinks')
            return drinks[1].description
        },
        _onSelect: (context, user) => {
            const drinks = context.fetchVariable('juo_last2_drinks')
            return user.drinkBoozeReturnEBAC(drinks[1].alcohol, drinks[1].description)
                .then((ebac) => {
                    const permilles = ebac.permilles
                    const permilles30Min = ebac.permilles30Min
                    return str_juo.on_drink.format({
                        drink_response: utils.getRandomFromArray(strings.drink_responses),
                        short_permilles_text: strings.short_permilles_text.format({
                            permilles: utils.roundTo(permilles, 2),
                            permilles30Min: utils.roundTo(permilles30Min, 2)
                        })
                    })
                })
        }
    }
}