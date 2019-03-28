var Discord = require('discord.io');
var request = require('request');
var repository = './repo/';
var util = require('./util/util');
var commands = require('./cmds/cmds');
var cache = require('./cache/cache');

try {
	var auth = require("./auth/auth.json");
} catch (e){
	console.log("No auth.JSON file.\n"+e.stack);
	process.exit();
}

// Thanks, https://www.reddit.com/r/DnD/comments/33i1hd/5e_spell_reference_mobile_app/cqocaf8/ for the spells list.
// Thanks, https://github.com/Buluphont/Spellbot for the monster list.
try {
	var dndJSON = require(repository+"dndCache.json");
	
	//Initialize holders for JSON information.
	var dndSpellCache = dndJSON.spells.data, dndSpellHash = dndJSON.spells.hash;
	var dndWeaponCache = dndJSON.weapons.data, dndWeaponHash = dndJSON.weapons.hash;
	var dndArmorCache = dndJSON.armors.data, dndArmorHash = dndJSON.armors.hash;
	var dndMonsterCache = dndJSON.monsters.data, dndMonsterHash = dndJSON.monsters.hash;
} catch (e){
	console.log("No dndCache.JSON file.\n"+e.stack);
}

var bot = new Discord.Client({
	token: auth.token,
	autorun: true
});

/* Statics */
var NO_RESPONSE = "NO_RESPONSE";

/* Bitwise flags */
var FLAGS = {NONE: 0, SPAM: 1, PING: 2, EMBD: 4, PICT: 8, PM: 16, SELF: 32}

/* Function input requests */
var PERMS = {NONE: 0, UID: 1, CHID: 2, MSGID: 4, BOT: 8}

var picResponseCache = cache.picResponseCache;

/*Event area*/
bot.on("ready", function(event){
	console.log("Connected!");
	console.log("Logged in as: ");
	console.log(bot.username + " - (" + bot.id + ")");
});

bot.on("message", function(user, userID, channelID, message, event){
	if(event.d.author.bot){return;}
	util.reactAtRandom({channelID: channelID, messageID: event.d.id, reaction: ":mysmm:539339078387367937", bot: bot});
	var msg = message.toLowerCase(), re = /(?:\[\[(.*?)\]\])/gmi, re2 = /(?:([^\n\r,]+))/gmi, cmds = [], temp1, temp2;

	//Exclusive section.
	if(picResponseCache[msg]) {
		sendFiles(channelID, [picResponseCache[msg]]);
	}
	
	if(dndWeaponHash[msg]){
		sendMessages(channelID, [commands.getWeaponString(dndWeaponCache[dndWeaponHash[msg]])]); return;
	}else if(dndSpellHash[msg]){
		sendEmbed(channelID, commands.getSpellString(dndSpellCache[dndSpellHash[msg]])); return;
	}else if(dndArmorHash[msg]){
		sendMessages(channelID, [commands.getArmorString(dndArmorCache[dndArmorHash[msg]])]); return;
	}else if(msg != "crab" && dndMonsterHash[msg]){
		sendEmbed(channelID, commands.getMonsterString(dndMonsterCache[dndMonsterHash[msg]])); return;
	}
	
	//Nonexclusive section.
	if (message.includes("my shit up") || message.includes("kys") || message.includes(bot.id)){
		sendMessages(channelID, ["<:fms:249379205840633857>"]);
	}

	if (message.includes("please clap")){
		sendMessages(channelID, ["👏"])
	}

	if (message.includes("please laugh")){
		sendMessages(channelID, ["😂"])
	}
	
	while((temp1 = re.exec(message)) != null){
		console.log("\n==== New Message ====\n" + user + " - " + userID + "\nin " + channelID + "\n" + message + "\n----------\n" + temp1[1]);
		cmds = [];
		while((temp2 = re2.exec(temp1[1])) != null){ cmds.push(temp2[1]); }
		
		var funcComm = commands.functionResponseCache[cmds[0].toLowerCase()];
		if(funcComm){
			if(!(funcComm.flags & FLAGS.SPAM) || !util.isNoSpamChannel(channelID)){
				var param = { cmds: cmds, userID: PERMS.UID & funcComm.permissions ? userID : null, channelID: PERMS.CHID & funcComm.permissions ? channelID : null, messageID: PERMS.MSGID & funcComm.permissions ? event.d.id : null, bot: PERMS.BOT & funcComm.permissions ? bot : null, callback: funcComm.flags & FLAGS.EMBD ? sendEmbed : null, cmdsArr : funcComm.flags & FLAGS.SELF ? commands.functionResponseCache : null }	
				var response = ((funcComm.flags & FLAGS.PING) ? util.pingUser(userID) : "") + funcComm.func(param);
				if(!(funcComm.flags & FLAGS.EMBD) && response != NO_RESPONSE){ sendMessages((funcComm.flags & FLAGS.PM) ? userID : channelID, [response]); }
			} else { console.log("Spam command: \"" + cmds[0] + "\" blocked in channel - " + channelID); }
		}
	}
	
	if(/(?:\[\[(\d+)d(\d+)(?:(kh|kl|k|dh|dl|d|>\?|<\?|=\?)(\d+))?(?:(\+|-)(\d+))?\]\])/gmi.test(message)){
		sendMessages(channelID, [util.handleRoll(message)]);
	}
	
	if(/(?:\[\[(\d+)d(\d+)f(\d+)s(\d+)?\]\])/gmi.test(message)){
		sendMessages(channelID, [util.handleCrab(message)]);
	}
});

bot.on("messageUpdate", function(event){});
bot.on("presence", function(user, userID, status, game, event){});
bot.on("any", function(event){});

bot.on("disconnect", function(){
	console.log("Bot disconnected");
	bot.connect() //Auto reconnect
});

/*Function declaration area*/
function sendMessages(ID, messageArr, interval) {
	var resArr = [], len = messageArr.length;
	var callback = typeof(arguments[2]) === 'function' ?  arguments[2] :  arguments[3];
	if (typeof(interval) !== 'number') interval = 50;

	function _sendMessages() {
		setTimeout(function() {
			if (messageArr[0]) {
				bot.sendMessage({
					to: ID,
					message: messageArr.shift()
				}, function(err, res) {
					resArr.push(err || res);
					if (resArr.length === len) if (typeof(callback) === 'function') callback(resArr);
				});
				_sendMessages();
			}
		}, interval);
	}
	_sendMessages();
}

function sendFiles(channelID, fileArr, interval) {
	var resArr = [], len = fileArr.length;
	var callback = typeof(arguments[2]) === 'function' ? arguments[2] : arguments[3];
	if (typeof(interval) !== 'number') interval = 50;

	function _sendFiles() {
		setTimeout(function() {
			if (fileArr[0]) {
				bot.uploadFile({
					to: channelID,
					file: fileArr.shift()
				}, function(err, res) {
					resArr.push(err || res);
					if (resArr.length === len) if (typeof(callback) === 'function') callback(resArr);
				});
				_sendFiles();
			}
		}, interval);
	}
	_sendFiles();
}

function sendEmbed(ID, _embed){
	bot.sendMessage({
		to: ID,
		embed: _embed
	});
}
