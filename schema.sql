
create table users (
  userId int not null primary key,
  nick text not null,
  weight int not null,
  gender string not null
);

create table groups (
  groupId int not null,
  title text not null,
  primary key (userId, groupId)
);
