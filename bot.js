const Discord = require("discord.js");
const client = new Discord.Client();
const config = require('./config.json');

client.login(config.token);

client.on('ready', () => {
	console.log(`Logged in as ${client.user.username}!`);
});

client.on("message", (message) => {
	if (!message.content.startsWith(config.prefix)) return;
	if (message.author.bot) return;

	if (message.content.startsWith(config.prefix + "ping")) {
		message.channel.sendMessage("pong!");
	} else
	if (message.content.startsWith(config.prefix + "foo")) {
		if(message.author.id !== config.ownerID) return;
		message.channel.sendMessage("bar!");
	}
});