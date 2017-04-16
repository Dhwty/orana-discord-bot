const Discord = require("discord.js");
const client = new Discord.Client();
const sql = require('sqlite');
const momentTZ = require('moment-timezone');
const schedule = require('node-schedule');
const config = require('./config.json');

console.log("Preparing Orana...\nNode version: " + process.version + "\nDiscord.js version: " + Discord.version);

sql.open(config.dbfile).catch(() => {console.error;});
client.login(config.token);

client.on('error', (e) => console.error(e));
client.on('warn', (e) => console.warn(e));
//client.on('debug', (e) => console.info(e));

let partyTime = new Date(2017, 3, 29, 11, 0, 0);

client.on('ready', () => {
	console.log(momentTZ.tz(new Date(), config.moTZ).toString() + `: Logged in as ${client.user.username}!`);
	
	console.log("Next party @ " + momentTZ.tz(partyTime, config.moTZ).toString());
	client.channels.get(config.announce).setTopic('Next party @ '+ momentTZ.tz(partyTime, config.moTZ).toString());
	
	//Begin scheduling system
	let day = (24*60*60*1000);
	let hour = (60*60*1000);
	let hh = (30*60*1000);
	let qh = (15*60*1000);
	let tm = (10*60*1000);
	let fm = (5*60*1000);
	
	let hourThree = new Date(partyTime.getTime() + hour);
	let hourTwo = new Date(hourThree.getTime() + hour);
	let hourOne = new Date(hourTwo.getTime() + hour);
	let minute30 = new Date(hourOne.getTime() + hh);
	let minute5 = new Date(minute30.getTime() + (hh-fm));
	let endTime = new Date(minute5.getTime() + (fm));
	
	var i = schedule.scheduleJob(hourThree, function() {
		client.channels.get(config.partyhard).sendMessage("Three hours remain in the current " + config.partyName + "!");
	})
	var j = schedule.scheduleJob(hourTwo, function() {
		client.channels.get(config.partyhard).sendMessage("Two hours remain in the current " + config.partyName + "!");
	})
	var k = schedule.scheduleJob(hourOne, function() {
		client.channels.get(config.partyhard).sendMessage("One hour remains in the current " + config.partyName + "!");
	})
	var l = schedule.scheduleJob(minute30, function() {
		client.channels.get(config.partyhard).sendMessage("Thirty minutes remain in the current " + config.partyName + "!");
	})
	var m = schedule.scheduleJob(minute5, function() {
		client.channels.get(config.partyhard).sendMessage("Five minutes remain in the current " + config.partyName + "!");
	})
	var n = schedule.scheduleJob(endTime, function() {
		client.channels.get(config.partyhard).sendMessage("The party is over! Thanks for joining us, and please come back next time!");
	})
	//End scheduling system
});

client.on("guildMemberAdd", (member) => {
  console.log(`New User "${member.user.username}" has joined "${member.guild.name}"` );
  member.addRole(config.guests).catch(console.error);
});

client.on("message", (message) => {
	//Begin logging
	if (message.channel.id === config.partyhard){
		var mtime = momentTZ.tz(new Date(message.createdAt), config.moTZ).toString();
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
		var mtime = momentTZ.tz(new Date(message.createdAt), config.moTZ).toString();
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
	//Begin CAH
	if (message.content.startsWith(config.prefix + "cah")) {
		let args = message.content.split(" ").slice(1);
		let url = args[0];
		let pwd = args[1];
		client.channels.get(config.announce).sendMessage(`CAH game at :link: <${url}>!\nThe password is: ${pwd}`);
	} else
	//End CAH
	//Begin +time (THIS DOES NOT WORK YET)
	if(message.content.startsWith(config.prefix + "time")){
		message.channel.sendMessage(partyTime.fromNow(true) + ' remaining');
	}
	//End +time
	//Begin owner-only commands
	if(message.author.id !== config.ownerID) message.channel.sendMessage("Excuse me?");
	if (message.content.startsWith(config.prefix + "shutdown")) {
		message.channel.sendMessage("*goes to bed.*\nPlease restart the service.");
		console.log('----- ' + momentTZ.tz(new Date(), config.moTZ).toString() + ': Bot shutdown via command. -----');
		client.destroy((err) => {
			console.log(err);
		});
	}else
	//Public channel & Owner only
	if(message.channel.type !== 'dm'){
		if (message.content.startsWith(config.prefix + "closed")) {
			message.channel.overwritePermissions(config.guests, {
				SEND_MESSAGES: false,
				READ_MESSAGES: false
			})
			.then(() => console.log(momentTZ.tz(new Date(), config.moTZ).toString() + ': Guests booted!'))
			.catch(console.error);
			//Begin remove patrons
			message.channel.overwritePermissions(config.patrons, {
				SEND_MESSAGES: false,
				READ_MESSAGES: false
			})
			.then(() => console.log(momentTZ.tz(new Date(), config.moTZ).toString() + ': Patrons booted!'))
			.catch(console.error);
			//End remove patrons
			message.channel.sendMessage("Party over. Guests cleared.");
		}
		if (message.content.startsWith(config.prefix + "open")) {
			message.channel.overwritePermissions(config.guests, {
				SEND_MESSAGES: true,
				READ_MESSAGES: true
			})
			.then(() => console.log(momentTZ.tz(new Date(), config.moTZ).toString() + ': Guests invited!'))
			.catch(console.error);
			//Begin add patrons
			message.channel.overwritePermissions(config.patrons, {
				SEND_MESSAGES: true,
				READ_MESSAGES: true
			})
			.then(() => console.log(momentTZ.tz(new Date(), config.moTZ).toString() + ': Patrons invited!'))
			.catch(console.error);
			//End add patrons
			message.channel.sendMessage("Party started. Channel open to guests.");
		}
	}else message.channel.sendMessage("This command can't be used in private messages.");
});

client.on('disconnect', function(erMsg, code) {
    console.log('----- ' + momentTZ.tz(new Date(), config.moTZ).toString() + ':  Bot disconnected from Discord with code', code, '-----');
});