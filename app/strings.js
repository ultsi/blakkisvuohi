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
    'drink_responses': [
        'Bäää.', 'Uuteen nousuun.', 'Muista juoda vettä!', 'Aamu alkaa A:lla.',
        'Muista juoda vettä!', 'Juo viinaa, viina on hyvää.', 'Meno on meno.',
        'Lörs lärä, viinaa!', 'Muista juoda vettä!'
    ],
    'help_text': 'BläkkisVuohi auttaa sinua ja ystäviäsi seuraamaan rippauksesi (lue: promillejesi) tasoa. Luo ensimmäiseksi tunnus komennolla /tunnus. Tunnuksen luomisen jälkeen voit alkaa kellottamaan juomia sisään komennolla /juoma. Annan sinulle arvioita rippauksesta komennolla /promillet. Minut voi myös lisätä ryhmään, jolloin kerron /promillet-komennolla kaikkien ryhmässä olevien rippitasot. Jokaisen ryhmäläisen täytyy kuitenkin sanoa ryhmässä /moro, jotta he pääsevät rippilistaukseen mukaan.',
    'terms': '*Terms of Service*\n\nThe following text outlines the terms of use of the BläkkisVuohi. Before using Bläkkisvuohi, you are required to read, understand, and agree to these terms.\n\n*Service*\n\nBläkkisVuohi is developed by us. It\'s main purpose is to help estimate users\' blood alcohol concentration. More features may be developed in the future. At times something can go wrong and the use of the service may be interrupted. We are not liable if something goes wrong.\n\nTo use BläkkisVuohi, you should have a Telegram account.\n\nBläkkisVuohi is provided for free.\n\nYou have to be over eighteen to use this bot.\n\nWe are not liable for any harm caused by this service\'s features.\n\nWe may stop providing the service at any time. You can stop using BläkkisVuohi at any time as well. You may need to reuse /terms command regularly to see if these terms are changed. New terms may be published without any additional notice.\n\n*Privacy Policy*\n\nWe take your privacy very seriously. By using BläkkisVuohi, you are accepting the practices outlined in this policy.\n\nFor the main features to work, we must store your Telegram user id, your username, your weight and your height upon registration. In addition to this, we must store your alcoholic intake with timestamps when you use features which estimate blood alcohol concentration. For group features to work, we store the group id associated with your user id. All of forementioned data is kept in store unless explicitly asked to remove.\n\nPlease contact us under the Telegram account @ultsi to report abuse & requests to access or delete personal information.\n\nThis Terms of Service and Privacy Policy is effective as of December 31, 2017.',
    'about': 'BläkkisVuohi is a bot currently developed and maintained by @ultsi. It\'s completely open source, free and licensed under GPLv3. Source code can be found at https://github.com/ultsi/blakkisvuohi. Terms of Service and Privacy Policy can be found by using the command /terms',
    /* jalkikellotus -strings */
    'jalkikellotus': {
        'start': 'Kuinka pitkältä aikaväliltä haluat syöttää unohtuneita juomia? Syötä aikaväli tunneissa. \n\nEsimerkiksi kaksi ja puoli tuntia: 2.5 \nYksi tunti ja 15 minuuttia: 1.25.',
        'hours_error': 'Tunnit väärin. Mahdolliset arvot välillä 0-24. Älä käytä pilkkua.',
        'input_drinks_start': 'Kirjoita juomia seuraavassa muodossa: \nJuomannimi Senttilitrat Tilavuusprosentti. \nEsimerkiksi: kalja 33 4.7. \n\nErota eri juomat joko rivinvaihdolla tai kirjoita useampi viesti. Lopeta kirjoittamalla stop.',
        'input_drinks_error': 'Kirjoititko varmasti ohjeiden mukaisesti? Käytä pistettä, älä pilkkua.',
        'cmd_text': '/jalkikellotus - Kellota unohtuneet juomat mukaan tilastoihin'
    }
};