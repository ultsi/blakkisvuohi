
create table if not exists users (
  userId int not null primary key,
  nick text not null,
  weight int not null,
  gender text not null
);

create table if not exists groups (
  groupId int not null,
  title text not null,
  primary key (groupId)
);

create table if not exists users_in_groups (
  userId int not null,
  groupId int not null,
  primary key (userId, groupId)
);

create table if not exists users_drinks (
  userId int not null,
  alcohol int not null, /* in milligrams */
  created timestamp not null default now()
);
