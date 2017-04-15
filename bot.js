const Discord = require("discord.js");
const client = new Discord.Client();
const sql = require('sqlite');
const moment = require('moment-timezone');
const schedule = require('node-schedule');
const config = require('./config.json');

console.log("Preparing Orana...\nNode version: " + process.version + "\nDiscord.js version: " + Discord.version);

sql.open(config.dbfile).catch(() => {console.error;});
client.login(config.token);

client.on('error', (e) => console.error(e));
client.on('warn', (e) => console.warn(e));
//client.on('debug', (e) => console.info(e));

client.on('ready', () => {
	loginTime = new Date();
	console.log(moment.tz(loginTime, config.moTZ).toString() + `: Logged in as ${client.user.username}!`);
	//Begin scheduling system
	let day = (24*60*60*1000);
	let hour = (60*60*1000);
	let hh = (30*60*1000);
	let qh = (15*60*1000);
	let tm = (10*60*1000);
	let fm = (5*60*1000);
	
	let startTime = new Date(2017, 3, 29, 11, 0, 0);
	console.log("Next party @ " + startTime);
	client.channels.get(config.announce).setTopic('Next party @ '+ moment.tz(startTime, config.moTZ).toString());
	let hourThree = new Date(startTime.getTime() + hour);
	let hourTwo = new Date(hourThree.getTime() + hour);
	let hourOne = new Date(hourTwo.getTime() + hour);
	let minute30 = new Date(hourOne.getTime() + hh);
	let minute5 = new Date(minute30.getTime() + (hh-fm));
	let endTime = new Date(minute5.getTime() + (fm));
	
	var i = schedule.scheduleJob(hourThree, function() {
		client.channels.get(config.partyhard).sendMessage("Three hours remain in this month's Rhapsody Chat!");
	})
	var j = schedule.scheduleJob(hourTwo, function() {
		client.channels.get(config.partyhard).sendMessage("Two hours remain in this month's Rhapsody Chat!");
	})
	var k = schedule.scheduleJob(hourOne, function() {
		client.channels.get(config.partyhard).sendMessage("One hour remains in this month's Rhapsody Chat!");
	})
	var l = schedule.scheduleJob(minute30, function() {
		client.channels.get(config.partyhard).sendMessage("Thirty minutes remain in this month's Rhapsody Chat!");
	})
	var m = schedule.scheduleJob(minute5, function() {
		client.channels.get(config.partyhard).sendMessage("Five minutes remain in this month's Rhapsody Chat!");
	})
	var n = schedule.scheduleJob(endTime, function() {
		client.channels.get(config.partyhard).sendMessage("The party is over! Thanks for joining us, and please come back next month!");
	})
});

client.on("guildMemberAdd", (member) => {
  console.log(`New User "${member.user.username}" has joined "${member.guild.name}"` );
  member.addRole(config.soporati).catch(console.error);
});

client.on("message", (message) => {
	//Begin logging
	if (message.channel.id === config.partyhard){
		var mtime = moment.tz(new Date(message.createdAt), config.moTZ).toString();
		sql.get(`SELECT * FROM ` + config.tablePartyhard + ` WHERE mid ='${message.id}'`).then(row => {
			if(!row){
				sql.run('INSERT INTO ' + config.tablePartyhard + ' (mid, userId, name, msg, time) VALUES (?, ?, ?, ?, ?)', [message.id, message.author.id, message.author.username, message.content,mtime]);
			}
		}).catch(() => {
			console.error;
			sql.run('CREATE TABLE IF NOT EXISTS ' + config.tablePartyhard + ' (mid TEXT, userId TEXT, name TEXT, msg TEXT, time TEXT)').then(() => {
				sql.run('INSERT INTO ' + config.tablePartyhard + ' (mid, userId, name, msg, time) VALUES (?, ?, ?, ?, ?)', [message.id, message.author.id, message.author.username, message.content,mtime]);
			});
		});
	}
	if (message.channel.id === config.magisterium){
		var mtime = moment.tz(new Date(message.createdAt), config.moTZ).toString();
		sql.get(`SELECT * FROM ` + config.tableMagisterium + ` WHERE mid ='${message.id}'`).then(row => {
			if(!row){
				sql.run('INSERT INTO ' + config.tableMagisterium + ' (mid, userId, name, msg, time) VALUES (?, ?, ?, ?, ?)', [message.id, message.author.id, message.author.username, message.content,mtime]);
			}
		}).catch(() => {
			console.error;
			sql.run('CREATE TABLE IF NOT EXISTS ' + config.tableMagisterium + ' (mid TEXT, userId TEXT, name TEXT, msg TEXT, time TEXT)').then(() => {
				sql.run('INSERT INTO ' + config.tableMagisterium + ' (mid, userId, name, msg, time) VALUES (?, ?, ?, ?, ?)', [message.id, message.author.id, message.author.username, message.content,mtime]);
			});
		});
	}
	//Begin commands
	if (message.author.bot) return;
	if (!message.content.startsWith(config.prefix)) return;
	if (message.content.startsWith(config.prefix + "cah")) {
		let args = message.content.split(" ").slice(1);
		let url = args[0];
		let pwd = args[1];
		client.channels.get(config.announce).sendMessage(`Cards Against Rhapsody game at :link: <${url}>!\nThe password is: ${pwd}`);
	} else
	//Begin owner-only commands
	if(message.author.id !== config.ownerID) message.channel.sendMessage("Excuse me?");
	if (message.content.startsWith(config.prefix + "shutdown")) {
		message.channel.sendMessage("*goes to bed.*\nPlease restart the service.");
		console.log('----- ' + moment.tz(new Date(), config.moTZ).toString() + ': Bot shutdown via command. -----');
		client.destroy((err) => {
			console.log(err);
		});
	}else
	//Public channel & Owner only
	if(message.channel.type !== 'dm'){
		if (message.content.startsWith(config.prefix + "closed")) {
			message.channel.overwritePermissions(config.soporati, {
				SEND_MESSAGES: false,
				READ_MESSAGES: false
			})
			.then(() => console.log(moment.tz(new Date(), config.moTZ).toString() + ': Soporati booted!'))
			.catch(console.error);
			message.channel.overwritePermissions(config.patrons, {
				SEND_MESSAGES: false,
				READ_MESSAGES: false
			})
			.then(() => console.log(moment.tz(new Date(), config.moTZ).toString() + ': Patrons booted!'))
			.catch(console.error);
			message.channel.sendMessage("Party over. Guests cleared.");
		}
		if (message.content.startsWith(config.prefix + "open")) {
			message.channel.overwritePermissions(config.soporati, {
				SEND_MESSAGES: true,
				READ_MESSAGES: true
			})
			.then(() => console.log(moment.tz(new Date(), config.moTZ).toString() + ': Soporati invited!'))
			.catch(console.error);
			message.channel.overwritePermissions(config.patrons, {
				SEND_MESSAGES: true,
				READ_MESSAGES: true
			})
			.then(() => console.log(moment.tz(new Date(), config.moTZ).toString() + ': Patrons invited!'))
			.catch(console.error);
			message.channel.sendMessage("Party started. Channel open to guests.");
		}
	}else message.channel.sendMessage("This command can't be used in private messages.");
});

client.on('disconnect', function(erMsg, code) {
    console.log('----- ' + moment.tz(new Date(), config.moTZ).toString() + ':  Bot disconnected from Discord with code', code, '-----');
});