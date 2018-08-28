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

create table if not exists users (
    userId text not null primary key,
    nick text not null,
    weight int not null,
    gender text not null,
    height int not null default 175,
    read_terms boolean not null default false,
    read_announcements int not null default 0,
    created timestamp with time zone not null default now()
);

create table if not exists groups (
    groupId bigint not null,
    title text not null,
    primary key (groupId)
);

create table if not exists users_in_groups (
    userId text not null,
    groupId text not null,
    primary key (userId, groupId)
);

create table if not exists users_drinks (
    id serial primary key,
    userId text not null,
    alcohol int not null, /* in milligrams */
    description text,
    created timestamp with time zone not null default now()
);
