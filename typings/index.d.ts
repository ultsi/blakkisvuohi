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
    various types used in the project
*/

declare interface NewRelicTransaction {
    end(): void
}

declare interface NewRelic {
    getTransaction(): NewRelicTransaction
    startWebTransaction(url: string, callback: () => void): Promise<any>
    noticeError(err: Error): void
}

declare namespace NodeJS {
    interface Global {
        newrelic: NewRelic
    }
}

declare interface ObjectConstructor {
    values(object: any): any[]
}

declare interface String {
    format(a: any): string
    unformat(a: any): string
}

declare interface TgChat {
    id: number
}

declare interface TgMSg {
    chat: TgChat
}
