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

const strings = module.exports = {};

strings.emoji = {
    beer: '🍺',
    beers: '🍻',
    wine: '🍷',
    glasses: '🥂',
    shot: '🥃',
    pencil: '✏',
    memo: '📝',
    cross: '❌',
    gear: '⚙',
    person_silhouette: '👤',
    scale: '⚖',
    ruler: '📏',
    female: '♀',
    male: '♂',
    trash: '🗑',
    refresh: '🔃',
    glowing_star: '🌟',
    stopwatch: '⏱',
    floppy_disk: '💾',
    bar_graph: '📊',
    info: 'ℹ',
    goat: '🐐',
    drink: '🍹'
};

strings.drink_responses = [
    'Bäää.', 'Uuteen nousuun.', 'Muista juoda vettä!', 'Aamu alkaa A:lla.',
    'Muista juoda vettä!', 'Juo viinaa, viina on hyvää.', 'Meno on meno.',
    'Lörs lärä, viinaa!', 'Muista juoda vettä!'
];
strings.short_permilles_text = '*Nyt:* {permilles}‰ - *30min:* {permilles30Min}‰';
strings.long_permilles_text = '*Nyt:* {permilles}‰ - *30min:* {permilles30Min}‰.\nVeressäsi on {grams} grammaa alkoholia, joka vastaa {standard_drinks} annosta. Olet selvinpäin {hours}h {minutes}min päästä.\n\nViimeisen kolmen päivän tapahtumat:\n{drinkList72h}';
strings.gender = {
    'male': 'Mies',
    'female': 'Nainen'
};
strings.yes = 'Kyllä';
strings.no = 'Ei';
strings.no_1st = 'En';
strings.commands = {
    /* System messages */
    blakkis: {
        please_update_user_info: 'Päivitä käyttäjätietosi käyttämällä komentoa /tunnus.',
        announcements: 'Ilmoituksia:\n\n{announcements}',
        unauthorized: 'Ei käyttöoikeutta.',
        user404: 'Rekisteröidy ensiksi käyttämällä komentoa /tunnus.',
        help_text: 'BläkkisVuohi auttaa sinua ja ystäviäsi seuraamaan rippauksesi (lue: promillejesi) tasoa. Aloita komennolla /start tai seuraa näitä ohjeita.\n\nLuo ensimmäiseksi tunnus komennolla /tunnus. Tunnuksen luomisen jälkeen voit alkaa kellottamaan juomia sisään komennolla /juoma. Annan sinulle arvioita rippauksesta komennolla /promillet. Minut voi myös lisätä ryhmään, jolloin kerron /promillet-komennolla kaikkien ryhmässä olevien rippitasot. Jokaisen ryhmäläisen täytyy kuitenkin sanoa ryhmässä /moro, jotta he pääsevät rippilistaukseen mukaan.',
        cmd_list: 'Komennot\n\n{cmd_list}',
        use_only_in_private: 'Käytä komentoa vain minun kanssa privaviestinä!',
        use_only_in_chats: 'Käytä komentoa vain chateissa!',
        command_not_found: 'Mitä? Jos kaipaat apua käyttämiseen, kirjoita /help',
        command_error: 'Virhe! Komennon käyttöohje: {cmd_help}',
        error: 'Vakava virhe! Ota yhteyttä @ultsi, niin minut saadaan korjattua.',
        on_cmd_register: 'Registered command {name}, scope: {scope}, privilege: {privilege}, type: {type}, definition: {definition}',
        back: '« Takaisin'
    },

    /* /about */
    about: {
        cmd_description: '/about - About the bot',
        text: 'BläkkisVuohi is a bot currently developed and maintained by @ultsi. It\'s completely open source, free and licensed under GPLv3. Source code can be found at https://github.com/ultsi/blakkisvuohi. Terms of Service and Privacy Policy can be found by using the command /terms'
    },

    /* /admin_loglevel */
    admin_loglevel: {
        cmd_description: '/loglevel <system|commands|db> <debug|info|error> - säädä logauksen määrää.',
        level_set_text: 'Asetettu \'{logger}\' tasoksi \'{level}\''
    },

    /* /admin_stats */
    admin_stats: {
        cmd_description: '/admin_stats - listaa botin statsit',
        stats_text: 'Tilastoja:\nKäyttäjiä on yhteensä {usersCount}kpl, joista 14pv sisällä aktiivisia {activeUsers14DaysCount}, ja 7pv sisällä aktiivisia {activeUsers7DaysCount}.\nRyhmiä on yhteensä {groupsCount}kpl, joista 14pv sisällä aktiivisia {activeGroups14DaysCount}, ja 7pv sisällä aktiivisia {activeGroups7DaysCount}. Lisäksi kaikki käyttäjät ovat yhteensä tilastoineet {global_drinks_count} juomaa.\nTop10 tilastot:\n\n{top10List}',
        error: 'Virhe! Tilastoja ei saatavilla.'
    },

    /* /annokset */
    annokset: {
        cmd_description: '/annokset - kertoo ryhmän kulutetut annokset viimeisen 48h ajalta',
        text_group: '{chat_title} -käyttäjien rippitaso:\nKäyttäjä...annoksia (yht. 12h/24h)\n\n{list}',
        text_group_list_item: '{username}... {standard_drinks}kpl ({drinks12h}/{drinks24h})'
    },

    start: {
        on_select: 'Veressäsi on {grams} grammaa alkoholia, joka vastaa {standard_drinks} annosta. Olet selvinpäin {hours}h {minutes}min päästä.{drink_list}',
        on_select_nonuser: 'BläkkisVuohi auttaa sinua ja ystäviäsi seuraamaan rippauksesi (lue: promillejesi) tasoa. Luo ensimmäiseksi tunnus valitsemalla Luo tunnus. Tunnuksen luomisen jälkeen voit alkaa kellottamaan juomia sisään juomavalikosta. Annan sinulle arvioita rippauksesta promillejen muodossa. Minut voi myös lisätä ryhmään, jolloin kerron /promillet-komennolla kaikkien ryhmässä olevien rippitasot. Jokaisen ryhmäläisen täytyy kuitenkin sanoa ryhmässä /moro, jotta he pääsevät rippilistaukseen mukaan.',
        header_user: strings.emoji.goat + ' *Bäää - {title}* ' + strings.emoji.goat + '\n\n*Nyt:* {permilles}‰ - *30min:* {permilles30Min}‰\n\n',
        header_nonuser: strings.emoji.goat + ' *Bäää - {title}* ' + strings.emoji.goat + '\n\n',
        header_title: 'Bläkkisvuohi',
        on_select_drinks3h: '\n\nViimeisen kolmen tunnin tapahtumat:\n{drinkList3h}',
        juo: {
            button_text: strings.emoji.glasses + ' Juo',
            header: strings.emoji.goat + ' *Bäää - {title}* ' + strings.emoji.goat + '\n\n*Nyt:* {permilles}‰ - *30min:* {permilles30Min}‰\n{drink_list}\n',
            header_drinks1h: '*Viimeisen tunnin tapahtumat:*\n{drinkList1h}\n',
            header_title: 'Juo',
            on_select: 'Valitse juomasi alla olevista valikoista. Jos et löydä etsimääsi, klikkaa *Oma juoma*. Jos olet unohtanut lisätä juomia, voit lisätä ne takautuvasti valitsemalla *Jälkikellotus*. Jos lisäsit vahingossa väärän juoman, valitse *Kumoa*. Kaksi alinta nappia ovat pikavalinnat kahdelle viimeisimmälle juomalle.',
            on_drink: '{drink_response} Juoma tallennettu.',
            miedot: {
                button_text: strings.emoji.beers + ' Miedot',
                header_title: 'Miedot',
                on_select: 'Valitse mieto.',
            },
            viinit: {
                button_text: strings.emoji.wine + ' Viinit',
                header_title: 'Viinit',
                on_select: 'Valitse viini.',
            },
            shotit: {
                button_text: strings.emoji.shot + ' Shotit',
                header_title: 'Shotit',
                on_select: 'Valitse shotti.',
            },
            oma: {
                button_text: strings.emoji.memo + ' Oma juoma',
                header_title: 'Oma juoma',
                on_select: 'Tilastoi oma juomasi. {help_example}',
                help_example: 'Kirjoita juoma muodossa senttilitrat prosentit.\nEsim.\n33cl 5.1%, tai 33 5.1',
                error_words: 'Liian paljon tai vähän sanoja. {help_example}',
                error_cl: 'Senttilitrat ei ole numero. {help_example}',
                error_vol: 'Prosentti ei ole numero. {help_example}',
                error_exceeds: 'Absoluuttisen alkoholin määrä on liian suuri. Tarkista numerot.'
            },
            jalkikellotus: {
                button_text: strings.emoji.stopwatch + ' Jälkikellotus',
                header_title: 'Jälkikellotus',
                on_select: 'Jälkikellottamalla voit tilastoida unohtuneet juomat monta tuntia jälkikäteen.\n\nKuinka pitkältä aikaväliltä haluat syöttää unohtuneita juomia? Syötä aikaväli tunneissa.\n\nEsimerkiksi kaksi ja puoli tuntia: *2.5*\nYksi tunti ja 15 minuuttia: *1.25*',
                hours_error: 'Tunnit väärin. Syötä arvo väliltä 0-24.',
                input_drinks_start: 'Kirjoita juomia seuraavassa muodossa: \nSenttilitrat Tilavuusprosentti. \nEsimerkiksi: 33 4.7. \n\nErota eri juomat joko rivinvaihdolla, tai kirjoita useampi viesti.',
                input_drinks_words_error: 'Sanojen määrän täytyy olla parillinen luku.',
                input_drinks_drink_error: 'Tarkista juoman {drink} senttilitrat ja tilavuus!',
                error_out_of_limits: 'Tarkista juoman {drink} senttilitrat ja tilavuus, nyt alkoholin määrä ylittää rajat!',
                input_drinks_drinks_correct: '{drinks_amount} juoma(a) syötetty onnistuneesti. Voit jatkaa juomien lisäämistä tai painaa Tallenna tilastoidaksesi syötetyt juomat.\n\nNykyiset syötetyt juomat:\n{drinks_list}',
                drink_name: 'Jälkikellotus',
                save: {
                    button_text: strings.emoji.floppy_disk + ' Tallenna',
                    on_select: '{drink_response} {drinks_amount} juomaa jälkikellotettu onnistuneesti!\n\n{short_permilles_text}'
                }
            },
            kumoa: {
                button_text: strings.emoji.cross + ' Kumoa',
                header_title: 'Kumoa',
                on_select: 'Olet kumoamassa viimeksi juodun juomasi. Oletko varma?\n\nKumottava juoma:\n*Nimi:* {last_drink_name}\n*Juotu:* {last_drink_created}',
                on_select_no_drinks: 'Ei kumottavia juomia.',
                success: 'Kumoaminen onnistui. Olet enää nyt *{permilles}‰* humalassa ja 30min päästä *{permilles30Min}‰* humalassa.',
            }
        },
        asetukset: {
            button_text: strings.emoji.gear + ' Asetukset',
            on_select: 'Asetuksista voit muokata tunnustasi tai poistaa tunnuksesi.',
            header: strings.emoji.goat + ' *Bäää - {title}* ' + strings.emoji.goat + '\n\n',
            header_title: 'Asetukset',
            muokkaa: {
                button_text: strings.emoji.person_silhouette + ' Muokkaa tunnusta',
                on_select: 'Voit muokata tässä tunnuksesi painoa, pituutta ja sukupuolta sekä päivittää nimimerkin.\n\nNykyiset tiedot:\n*Nimimerkki:* {username}\n*Paino:* {weight}kg\n*Pituus:* {height}cm\n*Sukupuoli:* {gender}\n*ID:* {user_id}\n*Käyttäjä luotu:* {created}',
                paino: {
                    button_text: strings.emoji.scale + ' Muokkaa painoa',
                    on_select: '*Paino nyt:* {weight}kg\n\nSyötä uusi painosi kokonaislukuna.',
                    on_change: 'Paino muutettu!'
                },
                pituus: {
                    button_text: strings.emoji.ruler + ' Muokkaa pituutta',
                    on_select: '*Pituus nyt:* {height}cm\n\nSyötä uusi pituutesi kokonaislukuna.',
                    on_change: 'Pituus muutettu!'
                },
                sukupuoli: {
                    button_text: strings.emoji.female + strings.emoji.male + ' Muokkaa sukupuolta',
                    on_select: '*Sukupuoli nyt:* {gender}\n\nValitse uusi biologinen sukupuolesi alta:',
                    on_change: 'Sukupuoli muutettu!'
                }
            },
            poista: {
                button_text: strings.emoji.trash + ' Poista tunnus',
                on_select: 'Olet poistamassa tunnuksesi. Hyväksymällä poistat kaiken sinuun liittyvän tiedon Bläkkisvuohen tietokannoista eikä sinua enää ole mahdollista listata missään listauksissa.\n\nOletko varma, että haluat poistaa tunnuksesi?',
                double_confirm: 'Oletko aivan varma? Kaikki tietosi *poistetaan* jos klikkaat kyllä.',
                canceled: 'Peruit tunnuksen poistamisen.',
                deleted: 'Kaikki tietosi on nyt poistettu. Rippaa rauhassa.'
            },
            paivita: {
                button_text: strings.emoji.refresh + ' Päivitä nimi',
                on_select: 'Nimi päivitetty! Nimesi on nyt: *{username}*. Voit päivittää nimeäsi vaihtamalla sen ensiksi Telegramin asetuksista, ja sen jälkeen päivittämällä sen tällä komennolla.'
            }
        },
        luo_tunnus: {
            button_text: strings.emoji.glowing_star + ' Luo tunnus',
            header_title: 'Luo tunnus',
            on_select: 'Tarvitset tunnusta käyttääksesi suurinta osaa botin ominaisuuksista. Aloita tunnuksen luominen syöttämällä painosi kilogrammoissa ja kokonaislukuna:',
            weight_error: 'Syötä paino uudelleen. Painon pitää olla kokonaisluku ja ala- ja ylärajat ovat 20kg ja 250kg.',
            height: 'Paino syötetty. Syötä seuraavaksi pituus senttimetreissä:',
            height_error: 'Syötä pituus uudelleen. Pituuden täytyy olla kokonaisluku ja ala- ja ylärajat ovat 120cm ja 240cm.',
            gender: 'Pituus syötetty. Syötä seuraavaksi biologinen sukupuoli:',
            gender_error: 'Syötä joko mies tai nainen:',
            terms: 'Sukupuoli syötetty. \n\n{terms}\n\nOletko lukenut ja hyväksynyt käyttöehdot?',
            terms_answer_yes: 'Kyllä',
            terms_answer_no: 'En',
            terms_on_reject: 'Lue käyttöehdot ja hyväksy ne, ennen kuin voit käyttää muita komentoja.',
            terms_error: 'Oletko lukenut ja hyväksynyt käyttöehdot?',
            update: 'Olet jo rekisteröitynyt. Tiedot päivitetty.',
            update_error: 'Olet jo rekisteröitynyt, mutta tietojen päivityksessä tuli ongelma. Ota yhteyttä adminiin.',
            new_user: 'Moikka {username}! Tunnuksesi luotiin onnistuneesti. Muista, että kaikki antamani luvut ovat vain arvioita, eikä niihin voi täysin luottaa.\n\nJa eikun juomaan!'
        },
        tilastoja: {
            button_text: strings.emoji.bar_graph + ' Tilastoja',
            header_title: 'Tilastoja',
            on_select: 'Valitse tarkasteltava tilasto alla olevista valikoista. *Kulutus* kertoo sinulle kokonaiskulutuksestasi lukuja ja *Otinko* listaa viimeisen 3 päivän aikana tilastoidut juomat.',
            kulutus: {
                button_text: 'Kulutus',
                on_select: 'Olet *{day_count}* päivän aikana tuhonnut *{grams}* grammaa alkoholia, joka vastaa *{standard_drinks}* annosta. Keskimäärin olet juonut *{avg_standard_drinks}* annosta per päivä.\n\nJos haluat tietää lähiajan kulutuksesi, kirjoita tarkasteltavien päivien määrä numerona.',
                prefilled: 'Olet *{day_count}* päivän aikana tuhonnut *{grams}* grammaa alkoholia, joka vastaa *{standard_drinks}* annosta. Keskimäärin olet juonut *{avg_standard_drinks}* annosta per päivä.',
                days7: '7 päivää',
                days14: '14 päivää',
                days30: '30 päivää',
                days60: '60 päivää'
            },
            otinko: {
                button_text: 'Otinko',
                on_select: 'Viimeisen kolmen vuorokauden tapahtumat:\n\n{drink_list}'
            }
        },
        help: {
            button_text: strings.emoji.info + ' Help',
            header: strings.emoji.goat + ' *Bäää - {title}* ' + strings.emoji.goat + '\n\n',
            header_title: 'Help',
            on_select: 'Missä tarvitset apua?',
            general: {
                button_text: 'Yleistä',
                header_title: 'Help: Yleistä',
                on_select: 'Bläkkisvuohi auttaa arvioimaan alkoholin määrää veressä eli promilleja. Botille tilastoidaan juomia sitä mukaa, kun niitä juodaan, ja botti laskee juoduista juomista promillet, palamisen huomioon ottaen. Lisäksi botin voi lisätä ryhmään ryhmätilastoja varten.\n\n*Käyttö*\n\nBotin käyttäminen on yksinkertaista. Juodut juomat tilastoidaan joko /juoma- tai /start- komentoja käyttäen ja botti laskee promillemäärän heti. Botin käyttö *vaatii tunnuksen* luomisen, jonka voi tehdä joko /tunnus- tai /start- komennoilla. Tunnus vaaditaan, jotta promillejen arviointi olisi mahdollisimman tarkkaa.'
            },
            faq: {
                button_text: 'FAQ',
                header_title: 'FAQ',
                on_select: 'Valitse yksi ala-aiheista:',
                juominen: {
                    button_text: 'Juominen',
                    header_title: 'FAQ: Juominen',
                    on_select: '*Kannattaako juoma merkata avatessa vai viimeistellessä?*\nJuomat kannattaa merkata silloin, kun ne avaa. Promillearvioinnissa oletetaan juoman imeytyvän 99-prosenttisesti 30 minuutissa. Lisäksi avatessa juoman muistaa merkata paremmin.\n\n*Kuinka tarkka promillejen arviointi on?*\nNoin 1.5‰ asti hyvin tarkka - tätä pidemmälle menneitä tutkimuksia ei ole tehty (jos on, laita viestiä @ultsi), joten laskukaava alkaa heittämään 1.5‰ jälkeen. Botin arviot ovat myös linjassa mm. lintukoto.net -laskurin kanssa.\n\n*Unohdin lisätä juomat, mitä nyt?*\nKäytä /jalkikellotus-komentoa, tai /start-valikosta löytyvää Jälkikellotus-nappulaa.'
                },
                ryhmat: {
                    button_text: 'Ryhmät',
                    header_title: 'FAQ: Ryhmät',
                    on_select: '*Miten voin liittyä ryhmään tai poistua ryhmästä?*\nKirjoita /moro, jos haluat liittyä ryhmään. Kirjoita /poistu, jos haluat poistua ryhmästä. Ryhmään liittyneenä sinun promilletasosi näkyy esim. /promillet-komennolla.\n\n*Miksi /kuvaaja -kuvassa kaikkien promillet laskee samaa tahtia?*\nPromillet kuvaavat alkoholin osuutta koko kehon verestä. Alkoholi palaa elimistössä nopeammin painavammilla ihmisillä, mutta veren määrä kehossa on tällöin myös suhteessa noin saman verran korkeampi. Tällöin promillejen väheneminen kehossa on kaikilla ihmisillä jotakuinkin sama.\n\n*Tallentaako Bläkkisvuohi ryhmän viestit?*\n*Ei tallenna.* Jos menet ryhmän käyttäjälistaukseen, Bläkkisvuohen kohdalla lukee "No access to messages", joka tarkoittaa, ettei Bläkkisvuohi voi millään tavalla lukea muita viestejä kuin komentoja.'
                },
                koodi: {
                    button_text: 'Koodi',
                    header_title: 'FAQ: Koodi',
                    on_select: '*Miten Bläkkisvuohi on koodattu?*\nLyhyesti: NodeJS-javascript-frameworkilla, sekä sen liitännäisillä ja tietokantana toimii Postgres. Pitkästi: katso koko koodi osoitteesta https://github.com/ultsi/blakkisvuohi.\n\n*Keksin uuden ominaisuuden, minne voin ilmoittaa siitä?*\nTällä hetkellä kehittäjänä toimii @ultsi, jolle voi laittaa suoraan privaviestiä. Issuen lisääminen githubiin toimii kanssa. https://github.com/ultsi/blakkisvuohi/issues\n\n*Saako Bläkkisvuohen koodaamisesta rahaa?*\nItseasiassa, saa. Futuricen työntekijänä @ultsi saa avoimen lähdekoodin projektien tekemisestä korvausta \'Spice Program\'-ohjelman mukaan. (https://spiceprogram.org/)'
                }
            },
            privacy: {
                button_text: 'Yksityisyys',
                header_title: 'Help: Yksityisyys',
                on_select: 'Sinun yksityisyys on turvattu Bläkkisvuohen kehittäjien toimesta mahdollisimman hyvin. Tässä muutama kohta yksityisyydestä:\n\n*Mitä tietoja kerätään?*\nBläkkisvuohen käyttö edellyttää seuraavien tietojen keräämistä:\n- Telegramiin määritelty nimimerkki tai nimi\n- Tiiviste(hash) Telegram-tilisi tunnisteesta (userId)\n- Paino\n- Pituus\n- Sukupuoli\n- Merkattujen juomien alkoholipitoisuudet, nimet ja juomisajat\n- Tiivisteet(hash) liityttyjen ryhmien tunnisteista (groupId)\n\n*Missä ja miten tietoja säilötään?*\nTietoja säilytetään virtuaalipalvelimella Euroopassa, ja vain Bläkkisvuohen ylläpitäjillä on sinne pääsy. Yksilöivät henkilötiedot on salattu salasanalla tietokannassa.\n\n*Minulla on lisäkysymyksiä yksityisyyteen liittyen!*\nOnnistuu, ota yhteyttä @ultsi.'
            }
        }
    },

    help: {
        cmd_description: '/help - tulosta ohje'
    },

    komennot: {
        cmd_description: '/komennot - listaa kaikki botin komennot'
    },

    /* jalkikellotus -strings */
    jalkikellotus: {
        cmd_description: '/jalkikellotus - Kellota unohtuneet juomat mukaan tilastoihin',
        start: 'Kuinka pitkältä aikaväliltä haluat syöttää unohtuneita juomia? Syötä aikaväli tunneissa. \n\nEsimerkiksi kaksi ja puoli tuntia: 2.5 \nYksi tunti ja 15 minuuttia: 1.25.',
        hours_error: 'Tunnit väärin. Mahdolliset arvot välillä 0-24.',
        input_drinks_start: 'Kirjoita juomia seuraavassa muodossa: \nSenttilitrat Tilavuusprosentti. \nEsimerkiksi: 33 4.7. \n\nErota eri juomat joko rivinvaihdolla, tai kirjoita useampi viesti. Lopeta ja tallenna juomat kirjoittamalla stop.',
        input_drinks_error: 'Kirjoititko varmasti ohjeiden mukaisesti?',
        input_drinks_drink_error: 'Tarkista juoman {drink} senttilitrat ja tilavuus!',
        error_out_of_limits: 'Tarkista juoman {drink} senttilitrat ja tilavuus, nyt alkoholin määrä ylittää rajat!',
        input_drinks_drink_saved: 'Juoma tallennettu!',
        drink_name: 'Jälkikellotus'
    },

    /* /juoma */
    juoma: {
        cmd_description: '/juoma - lisää yksi juoma tilastoihin',
        start: 'Valitse juoman kategoria',
        start_error: 'Virhe! Valitse yksi kategorioista',
        to_start: 'Alkuun',
        milds: 'Miedot',
        booze: 'Tiukat',
        self_define: 'Oma',
        choose_mild: 'Valitse mieto',
        choose_booze: 'Valitse tiukka',
        self_define_vol: 'Syötä juoman tilavuusprosentti numerona. Esim: 12.5 (viini), 5.5 (lonkero), 60 (absintti)',
        self_define_cl: 'Syötä juoman määrä senttilitroissa numerona. Esim: 4 (shotti), 33 (tölkki), 70 (viinipullo)',
        self_define_error_alcohol_limit: 'Absoluuttisen alkoholin määrä on liian suuri. Aloita uusiksi'
    },

    /* /kalja033 */
    kalja033: {
        cmd_description: '/kalja033 - pikanäppäin yhdelle kappaleelle olutta. Ammattilaiskäyttöön.'
    },

    /* /kalja05 */
    kalja05: {
        cmd_description: '/kalja05 - pikanäppäin yhdelle kappaleelle 0.5l olutta. Ammattilaiskäyttöön.'
    },

    /* /kuvaaja */
    kuvaaja: {
        cmd_description: '/kuvaaja - Näyttää ryhmän 24h tapahtumat kuvaajana.',
        graph_title: 'Promillekuvaaja feat. {chat_title}',
        img_failed: 'Kuvan muodostus epäonnistui!'
    },

    /* /laatta */
    laatta: {
        cmd_description: '/laatta - Poista viimeksi merkattu juoma tilastoista.',
        start_text: 'Olet laattaamassa viimeksi juodun juomasi. Oletko varma?',
        start_answer_yes: 'Kyllä',
        start_answer_no: 'En',
        error_text: 'Kirjoita kyllä tai en.',
        success: 'Laatta onnistui. Olet enää nyt {permilles}‰ humalassa ja 30min päästä {permilles30Min}‰ humalassa.',
        cancel: 'Laatta peruttu.'
    },

    /* /moro */
    moro: {
        cmd_description: '/moro - Lisää sinut ryhmään mukaan.',
        join_text: 'Rippaa rauhassa kera {chat_title} -kavereiden.'
    },

    /* /poistu */
    poistu: {
        cmd_description: '/poistu - Poistu ryhmästä.',
        leave_text: 'Ei enää rippausta kera {chat_title} -kavereiden.'
    },

    /* /promillet */
    promillet: {
        cmd_description: '/promillet - näytä sinun tai ryhmän promillet. Yksityisviestinä käytettynä listaa myös viimeisen 3pv tapahtumat.',
        text_group: '{chat_title} -käyttäjien rippitaso:\nKäyttäjä...‰ (annoksia 12h/24h)\n\n{list}',
        text_group_list_item: '{username}... {permilles} ({drinks12h}/{drinks24h})'
    },

    /* /stats */
    stats: {
        cmd_description: '/stats - listaa ryhmän tai sinun kulutustilastoja. Lisäämällä numeron komennon perään voit valita, kuinka monelta päivältä taaksepäin haluat tilastot',
        private: 'Olet {day_count} päivän aikana tuhonnut {grams} grammaa alkoholia, joka vastaa {standard_drinks} annosta. Keskimäärin olet juonut {avg_standard_drinks} annosta per päivä.',
        group: 'Tilastoja:\n\nRyhmän jäsenet ovat {day_count} päivän aikana tuhonneet {grams} grammaa alkoholia, joka vastaa {standard_drinks} annosta. Keskimäärin on juotu {avg_standard_drinks} annosta per päivä. Lisäksi kaikki käyttäjät globaalisti ovat yhteensä tilastoineet {global_drinks_count} juomaa. Hienosti.\n\nTop10 tilastot *juomina*:\n\n{top10List}'
    },

    /* /stats2 */
    stats2: {
        cmd_description: '/stats - listaa ryhmän tai sinun kulutustilastoja annoksittain. Lisäämällä numeron komennon perään voit valita, kuinka monelta päivältä taaksepäin haluat tilastot',
        private: 'Olet {day_count} päivän aikana tuhonnut {grams} grammaa alkoholia, joka vastaa {standard_drinks} annosta. Keskimäärin olet juonut {avg_standard_drinks} annosta per päivä.',
        group: 'Tilastoja:\n\nRyhmän jäsenet ovat {day_count} päivän aikana tuhonneet {grams} grammaa alkoholia, joka vastaa {standard_drinks} annosta. Keskimäärin on juotu {avg_standard_drinks} annosta per päivä. Lisäksi kaikki käyttäjät globaalisti ovat yhteensä tilastoineet {global_drinks_std} annosta. Hienosti.\n\nTop10 tilastot *annoksina*:\n\n{top10List}'
    },

    /* /terms */
    terms: {
        cmd_description: '/terms - Terms of Service',
        reply: '*Käyttöehdot*\n\nKäyttämällä Bläkkisvuohea olet hyväksynyt seuraavat käyttöehdot. Bläkkisvuohen päätarkoitus on arvioida alkoholin määrää kehossa. Bläkkisvuohen toiminta voi muuttua tai pysähtyä milloin vain. Sinun täytyy olla yli 18 vuotta käyttääksesi Bläkkisvuohea. Bläkkisvuohen kehittäjät tai ylläpitäjät eivät ole vastuussa mistään suorasta tai epäsuorasta haitasta, jota palvelun käyttäminen voi aiheuttaa. Bläkkisvuohi on ilmainen käyttää. Ominaisuuksien, kuten promillejen arvioiminen, takia Bläkkisvuohi tallentaa käyttäjistä erinäisiä tietoja ja käyttää näitä hyväksi laskennassa. Sinuun suoraan linkitettävät tiedot salataan ennen tallentamista. Tietoja ei koskaan anneta tai myydä eteenpäin kolmansille osapuolille. Tallennetut tiedot voidaan poistaa pyynnöstä.\n\nBläkkisvuohen tuottamat arviot ovat arvioita, eikä niihin voi missään tapauksessa täysin luottaa. Noudata lakia, kun käytät alkoholia.\n\nNämä käyttöehdot voivat muuttua milloin vain ilman erillistä huomautusta. Uusimmat käyttöehdot voi aina lukea /terms-komennolla. Nämä käyttöehdot ovat voimassa 10.01.2018 lähtien.',
    },

    /* /tunnus */
    tunnus: {
        cmd_description: '/tunnus - Luo itsellesi uusi tunnus tai muokkaa tunnustasi.',
        start: 'Tervetuloa tunnuksen luomiseen tai päivittämiseen. Alkoholilaskuria varten tarvitsen seuraavat tiedot: paino, pituus ja sukupuoli.\n\nSyötä ensimmäiseksi paino kilogrammoissa ja kokonaislukuna:',
        start_error: 'Syötä paino uudelleen. Painon pitää olla kokonaisluku ja ala- ja ylärajat ovat 20kg ja 250kg.',
        height: 'Paino tallennettu. Syötä seuraavaksi pituus senttimetreissä:',
        height_error: 'Syötä pituus uudelleen. Pituuden täytyy olla kokonaisluku ja ala- ja ylärajat ovat 120cm ja 240cm.',
        gender: 'Pituus tallennettu. Syötä seuraavaksi sukupuoli:',
        gender_error: 'Syötä joko mies tai nainen:',
        terms: 'Sukupuoli tallennettu. \n\n{terms}\n\nOletko lukenut ja hyväksynyt käyttöehdot?',
        terms_answer_yes: 'Kyllä',
        terms_answer_no: 'En',
        terms_on_reject: 'Lue käyttöehdot ja hyväksy ne, ennen kuin voit käyttää muita komentoja.',
        terms_error: 'Oletko lukenut ja hyväksynyt käyttöehdot?',
        update: 'Olet jo rekisteröitynyt. Tiedot päivitetty.',
        update_error: 'Olet jo rekisteröitynyt, mutta tietojen päivityksessä tuli ongelma. Ota yhteyttä adminiin.',
        new_user: 'Moikka {username}! Tunnuksesi luotiin onnistuneesti. Muista, että kaikki antamani luvut ovat vain arvioita, eikä niihin voi täysin luottaa. Ja eikun juomaan!'
    },

    /* /whoami */
    whoami: {
        cmd_description: '/whoami - tulosta omat tietosi.',
        reply: 'Käyttäjä {username}\nID: {user_id}\nPaino: {weight}kg\nPituus: {height}cm\nSukupuoli: {gender}\nKäyttäjä luotu: {created}'
    }
};