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
    strings.js
    Contains all printable strings of the app
*/

'use strict';

module.exports = {
    drink_responses: [
        'Bäää.', 'Uuteen nousuun.', 'Muista juoda vettä!', 'Aamu alkaa A:lla.',
        'Muista juoda vettä!', 'Juo viinaa, viina on hyvää.', 'Meno on meno.',
        'Lörs lärä, viinaa!', 'Muista juoda vettä!'
    ],
    short_permilles_text: 'Nyt: {permilles}‰, 30min: {permilles30Min}‰',
    long_permilles_text: 'Nyt: {permilles}‰, 30min: {permilles30Min}‰.\nVeressäsi on {grams} grammaa alkoholia, joka vastaa {standard_drinks} annosta. Olet selvinpäin {hours}h {minutes}min päästä.\n\nViimeisen kolmen päivän tapahtumat:\n{drinkList72h}',
    commands: {
        /* System messages */
        blakkis: {
            please_update_user_info: 'Päivitä käyttäjätietosi käyttämällä komentoa /tunnus.',
            announcements: 'Ilmoituksia:\n\n{announcements}',
            unauthorized: 'Ei käyttöoikeutta.',
            help_text: 'BläkkisVuohi auttaa sinua ja ystäviäsi seuraamaan rippauksesi (lue: promillejesi) tasoa. Luo ensimmäiseksi tunnus komennolla /tunnus. Tunnuksen luomisen jälkeen voit alkaa kellottamaan juomia sisään komennolla /juoma. Annan sinulle arvioita rippauksesta komennolla /promillet. Minut voi myös lisätä ryhmään, jolloin kerron /promillet-komennolla kaikkien ryhmässä olevien rippitasot. Jokaisen ryhmäläisen täytyy kuitenkin sanoa ryhmässä /moro, jotta he pääsevät rippilistaukseen mukaan.',
            cmd_list: 'Komennot\n\n{cmd_list}',
            terms: '*Käyttöehdot*\n\nKäyttämällä Bläkkisvuohea olet hyväksynyt seuraavat käyttöehdot. Bläkkisvuohen päätarkoitus on arvioida alkoholin määrää kehossa. Bläkkisvuohen toiminta voi muuttua tai pysähtyä milloin vain. Sinun täytyy olla yli 18 vuotta käyttääksesi Bläkkisvuohea. Bläkkisvuohen kehittäjät tai ylläpitäjät eivät ole vastuussa mistään suorasta tai epäsuorasta haitasta, jota palvelun käyttäminen voi aiheuttaa. Bläkkisvuohi on ilmainen käyttää. Ominaisuuksien, kuten promillejen arvioiminen, takia Bläkkisvuohi tallentaa käyttäjistä erinäisiä tietoja ja käyttää näitä hyväksi laskennassa. Sinuun suoraan linkitettävät tiedot salataan ennen tallentamista. Tietoja ei koskaan anneta tai myydä eteenpäin kolmansille osapuolille. Tallennetut tiedot voidaan poistaa pyynnöstä.\n\nBläkkisvuohen tuottamat arviot ovat arvioita, eikä niihin voi missään tapauksessa täysin luottaa. Noudata lakia, kun käytät alkoholia.\n\nNämä käyttöehdot voivat muuttua milloin vain ilman erillistä huomautusta. Uusimmat käyttöehdot voi aina lukea /terms-komennolla. Nämä käyttöehdot ovat voimassa 10.01.2018 lähtien.',
            use_only_in_private: 'Käytä komentoa vain minun kanssa privaviestinä!',
            command_not_found: 'Mitä? Jos kaipaat apua käyttämiseen, kirjoita /help',
            command_error: 'Virhe! Komennon käyttöohje: {cmd_help}',
            error: 'Vakava virhe! Ota yhteyttä @ultsi, niin minut saadaan korjattua.'
        },

        /* /about */
        about: {
            text: 'BläkkisVuohi is a bot currently developed and maintained by @ultsi. It\'s completely open source, free and licensed under GPLv3. Source code can be found at https://github.com/ultsi/blakkisvuohi. Terms of Service and Privacy Policy can be found by using the command /terms',
            cmd_text: '/about - About the bot',
        },

        /* /annokset */
        annokset: {
            text_group: '{chat_title} -käyttäjien rippitaso:\nKäyttäjä...annoksia (yht. 12h/24h)\n\n{list}',
            text_group_list_item: '{username}... {standard_drinks}kpl ({drinks12h}/{drinks24h})',
            cmd_text: '/annokset - kertoo ryhmän kulutetut annokset viimeisen 48h ajalta'
        },

        /* jalkikellotus -strings */
        jalkikellotus: {
            start: 'Kuinka pitkältä aikaväliltä haluat syöttää unohtuneita juomia? Syötä aikaväli tunneissa. \n\nEsimerkiksi kaksi ja puoli tuntia: 2.5 \nYksi tunti ja 15 minuuttia: 1.25.',
            hours_error: 'Tunnit väärin. Mahdolliset arvot välillä 0-24. Älä käytä pilkkua.',
            input_drinks_start: 'Kirjoita juomia seuraavassa muodossa: \nJuomannimi Senttilitrat Tilavuusprosentti. \nEsimerkiksi: kalja 33 4.7. \n\nErota eri juomat joko rivinvaihdolla tai kirjoita useampi viesti. Lopeta kirjoittamalla stop.',
            input_drinks_error: 'Kirjoititko varmasti ohjeiden mukaisesti? Käytä pistettä, älä pilkkua.',
            input_drinks_drink_error: 'Tarkista juoman {drink} senttilitrat ja tilavuus!',
            input_drinks_drink_saved: 'Juoma tallennettu!',
            cmd_text: '/jalkikellotus - Kellota unohtuneet juomat mukaan tilastoihin'
        },

        /* /juoma */
        juoma: {
            start: 'Valitse juoman kategoria',
            to_start: 'Alkuun',
            milds: 'Miedot',
            booze: 'Tiukat',
            self_define: 'Oma',
            choose_mild: 'Valitse mieto',
            choose_booze: 'Valitse tiukka',
            self_define_vol: 'Syötä juoman tilavuusprosentti numerona. Esim: 12.5 (viini), 5.5 (lonkero), 60 (absintti)',
            self_define_cl: 'Syötä juoman määrä senttilitroissa numerona. Esim: 4 (shotti), 33 (tölkki), 70 (viinipullo)',
            cmd_text: '/juoma - lisää yksi juoma tilastoihin'
        },

        /* /kalja033 */
        kalja033: {
            cmd_text: '/kalja033 - pikanäppäin yhdelle kappaleelle olutta. Ammattilaiskäyttöön.'
        },

        /* /kalja05 */
        kalja05: {
            cmd_text: '/kalja05 - pikanäppäin yhdelle kappaleelle 0.5l olutta. Ammattilaiskäyttöön.'
        },
        /* /promillet */
        promillet: {
            text_group: '{chat_title} -käyttäjien rippitaso:\nKäyttäjä...‰ (annoksia 12h/24h)\n\n{list}',
            text_group_list_item: '{username}... {permilles} ({drinks12h}/{drinks24h})'
        },
    }
};