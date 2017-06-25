
create table users (
  userId int not null primary key,
  nick text not null,
  weight int not null,
  gender string not null
);

create table groups (
  userId int not null,
  groupId int not null,
  primary key (userId, groupId)
);
