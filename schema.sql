create database bitsocial default charset 'UTF8';
create user james identified with mysql_native_password by 'bond';
grant all on bitsocial.* to james;
use bitsocial;
create table start(
	name         character varying(200) unique not null,
	value        character varying(200)
);
insert into start(name,value) values('contract', '0x00');
insert into start(name,value) values('minimum',  '0.1');
insert into start(name,value) values('secret',   'Guest');
insert into start(name,value) values('photo-folder',  'photos');
insert into start(name,value) values('photo-limit',   '1000000');
insert into start(name,value) values('photo-default', 'empty-profile.png');

create table members(
	number       integer unique not null auto_increment,
	email        character varying(200) unique not null,
	password     character varying(200) not null,
	first_name   character varying(200) not null,
	last_name    character varying(200) not null,
	gender       character,
	wallet       character varying(200) unique,
	profile      character varying(200) not null default 'empty-profile.png',
	alias        character varying(200) unique
);

insert into members(email,password,first_name,last_name,gender,alias)
	values('alice@email.com', sha2('alice123', 512), 'Alice', 'Taylor', 'F', 'alice');

insert into members(email,password,first_name,last_name,gender,alias)
	values('bob@email.com', sha2('bob123', 512), 'Bob', 'Johnson', 'M', 'bob');

insert into members(email,password,first_name,last_name,gender,alias)
	values('carl@email.com', sha2('carl123', 512), 'Carl', 'Williams', 'M', 'carl');

insert into members(email,password,first_name,last_name,gender,alias)
	values('diana@email.com', sha2('diana123', 512), 'Diana', 'Brown', 'F', 'diana');

create table posts(
	number     integer unique not null auto_increment,
	detail     character varying(8000) not null,
	time       timestamp,
	owner      integer references members(number)
);

insert into posts(detail, time, owner)
	values('I was an ordinary person who studied hard.', now(), 1);

insert into posts(detail, time, owner)
	values('The quick brown fox jumps over a lazy dog.', now(), 1);

insert into posts(detail, time, owner)
	values('If you can''t explain it to a six year old, you don''t understand it yourself.', now(), 1);

insert into posts(detail, time, owner)
	values('Patience is a key element of success.', now(), 1);

insert into posts(detail, time, owner)
	values('Television is not real life. In real life, people actually have to leave the coffee shop and go to jobs.', now(), 1);

insert into posts(detail, time, owner)
	values('You don''t have to start from scratch to do something interesting.', now(), 1);

/*
insert into posts(detail, time, owner)
	values('', now(), 1);
*/
















/*
deposit(value)
withdraw(value)

getBalance() view
getBalance(address) view

*/
