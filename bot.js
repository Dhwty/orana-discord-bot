const Discord = require("discord.js");
const client = new Discord.Client();
const sql = require('sqlite');
var moment = require('moment-timezone');
const schedule = require('node-schedule');
const config = require('./config.json');

console.log("Preparing Orana...\nNode version: " + process.version + "\nDiscord.js version: " + Discord.version);

sql.open('./fanchat.sqlite');
client.login(config.token);

client.on('error', (e) => console.error(e));
client.on('warn', (e) => console.warn(e));
//client.on('debug', (e) => console.info(e));

client.on('ready', () => {
	console.log(`Logged in as ${client.user.username}!`);
	//Begin timer system
	let day = (24*60*60*1000);
	let hour = (60*60*1000);
	let hh = (30*60*1000);
	let qh = (15*60*1000);
	let tm = (10*60*1000);
	let fm = (5*60*1000);
	
	let startTime = new Date(2017, 3, 22, 11, 0, 0);
	console.log("Next party @ " + startTime);
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

	/*var rule = new schedule.RecurrenceRule(); // Creates new Recurrence Rule
	rule.minute = 0; // Must set to 0 or scheduled job will run every minute.
	rule.hour = [14, 19, 20]; // Hours are based on your system's time.

	var j = schedule.scheduleJob(rule, function() {
		bot.channels.get("id", channel).sendMessage("Announcement at 2PM, 7PM, and 8PM");
	})

	//For different announcements:
	rule.hour = 8; // Set different time. Use array like above for multiple hours.

	var i = schedule.scheduleJob(rule, function() {
		bot.channels.get("id", channel).sendMessage("Announcement at 8AM");
	})
	// Repeat for more announcements
	*/
});

client.on("message", (message) => {
	if (message.channel.id === config.partyhard){
		var mtime = moment.tz(new Date(message.createdAt), "America/New_York").toString();
		sql.get(`SELECT * FROM fanchat WHERE mid ='${message.id}'`).then(row => {
			if(!row){
				sql.run('INSERT INTO fanchat (mid, userId, name, msg, time) VALUES (?, ?, ?, ?, ?)', [message.id, message.author.id, message.author.username, message.content,mtime]);
			}
		}).catch(() => {
			console.error;
			sql.run('CREATE TABLE IF NOT EXISTS fanchat (mid TEXT, userId TEXT, name TEXT, msg TEXT)').then(() => {
				sql.run('INSERT INTO fanchat (mid, userId, name, msg, time) VALUES (?, ?, ?, ?, ?)', [message.id, message.author.id, message.author.username, message.content,mtime]);
			});
		});
	}
	if (message.author.bot) return;
	if (!message.content.startsWith(config.prefix)) return;
	if (message.content.startsWith(config.prefix + "cah")) {
		let args = message.content.split(" ").slice(1);
		let url = args[0];
		let pwd = args[1];
		client.channels.get(config.announce).sendMessage(`Cards Against Rhapsody game at :link: <${url}>!\nThe password is: ${pwd}`);
	} else
	if (message.content.startsWith(config.prefix + "ping")) {
		message.channel.sendMessage("Pong!");
	} else
	//Owner-only commands
	if(message.author.id !== config.ownerID) message.channel.sendMessage("Excuse me?");
	if (message.content.startsWith(config.prefix + "shutdown")) {
		message.channel.sendMessage("*goes to bed.*\nPlease restart the service.");
		client.destroy((err) => {
			console.log(err);
		});
	}else
	if (message.content.startsWith(config.prefix + "closed")) {
		// overwrite permissions for a message author
		client.channels.get(config.partyhard).overwritePermissions(client.guild.roles("name","patron"), {
			SEND_MESSAGES: false
		})
		.then(() => console.log('Patrons booted!'))
		.catch(console.error);
	}else
	if(message.content.startsWith(config.prefix + "role the bones")) {
		message.channel.sendMessage(message.id + "..." + (config.gid).name);
	}
});