# Orana
A bot for discord servers doing events with time constraints and guests. Uses Discord.js.

In theory, if you `node install` this thing, it *should* pull the dependencies. It's got a package.json. IDFK, it's my first time working with node.

## What she does:
Orana is designed to host parties.
* She'll assign a guest role to all people who join the server.
* When you `+open` or `+close` a room, she'll allow or disallow those guests (and Patrons) from entering.
* She can set the topic in the Announcements channel to the date and time of the next party.
* She can announce how much time is left in a party, and when the party is over.
* She can log both the general chat channel and the party channel in two different tables in an sqlite file. (She doesn't handle deleted or edited posts, though, so it'll just save the initial version of the text.)
* If you use Pretend You're Xyzzy for Cards Against Humanity games, you can have her post new games to the announcements channel.

## Setting this shit up:
I'm going to assume you can actually get her installed, because Node and I... *shrugs* I can't code my way out of a wet paper bag. 

* Create a new Discord application: <https://discordapp.com/developers/applications/me/>
	* Name it whatever you like! She's just Orana, for me, because I like the name.
	* Doesn't need to be public.
	* Doesn't need OAuth2.
	* Give her an icon and a description, if you like, then save.
* Get the Client ID and the Token from this page. You'll have to click to reveal the token, because DO NOT LET THE TOKEN GO PUBLIC.
* Create a file in the same folder with the bot, on your computer, named something like `chatlogs.sqlite`. You don't have to do anything else to it, just make sure it exists.
* Copy `config.json.example` to `config.json` and start filling in the blanks. You'll need:
	* The bot token for the Discord API
	* A prefix that's distinct from any other bot on the channel, so they don't get confused. (Default is `+` )
	* Your ID number (Turn on Developer Options, then right-click your name in Discord and select 'Copy ID'.)
	* The name of your sqlite file
	* The names of the tables you want to use for logs in General Chat and Party
	* The name of your timezone. (By default, Orana will use `America/New York`.)
	* The ID numbers of your Announcements, General Chat, and Party channels. (Right-click, 'Copy ID'.)
	* The ID numbers of your Guest, Patron (if you use Patreon and its bot), and regular Member roles. (Set roles so they can be mentioned, then `\@rolename`.)
	* The date for the next party, in a format JS can parse. (`Y, M, D, H, M, S` seems to work, for example: `2017, 3, 29, 11, 0, 0`. Keep in mind that JS is weird about dates, so months are one less than you think they are, because January is 0, not 1.)
* Open a console in the bot folder and `node bot.js`. You should see her go through a few checks and then start. Errors, if any, will show up in the console. (And she's kind of noisy, console-side. She announces connects, disconnects, errors, intentional shutdowns, and channel open/close commands.)
* Connect her to a server that you're an admin on. (It'll only work if you're an admin.) If you use the following link, after replacing `BOT_CLIENT_ID` with the client ID from the Discord developer application screen, it'll correctly set her permissions when she connects. https://discordapp.com/oauth2/authorize?client_id=BOT_CLIENT_ID&scope=bot&permissions=268504080
* At this point? Her functions should start working as intended in the server she's connected to.

Note that if you change anything in `config.json` or `bot.js`, like the next party date, you will need to restart the bot. To do this, either CTRL-C at the console, or `+shutdown` in a channel or PM (bot owner only), and then `node bot.js` again.

## Stupid Problems
* I haven't figured out how to bump the date into config.json, so the party date (and scheduling announcements) has to be done directly in bot.js. I'll care later.
