var Discord = require('discord.io');
var request = require('request');
var repository = './repo/';
var util = require('./util/util');
var commands = require('./cmds/cmds');
var cache = require('./cache/cache');

// Get auth data for login.
try {
	var auth = require("./auth/auth.json");
} catch (e){
	console.log("No auth.JSON file.\n"+e.stack);
	process.exit();
}

// Get DnD data.
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
var YES = "YES";
var NO = "NO";
var NO_RESPONSE = "NO_RESPONSE";

var picResponseCache = cache.picResponseCache;

/*Event area*/
bot.on("ready", function(event) {
	console.log("Connected!");
	console.log("Logged in as: ");
	console.log(bot.username + " - (" + bot.id + ")");
});

bot.on("messageUpdate", function(event) {
	//console.log(event);
	//console.log("caught edit!");
});

bot.on("message", function(user, userID, channelID, message, event) {
	
	if(userID == bot.id){return;}
	var msg = message.toLowerCase(), re = /(?:\[\[(.*?)\]\])/gmi, re2 = /(?:([^\n\r,]+))/gmi, cmds = [], temp1, temp2;
	/*
	console.log("\n==== New Message ====");
	console.log(user + " - " + userID);
	console.log("in " + channelID);
	console.log(message);
	console.log("----------");
	*/
	//Exclusive section.
	if(picResponseCache[msg]) {
		sendFiles(channelID, [picResponseCache[msg]]);
	}
	
	if(dndWeaponHash[msg]){
		sendMessages(channelID, [commands.getWeaponString(dndWeaponCache[dndWeaponHash[msg]])]); return;
	}else if(dndSpellHash[msg]){
		sendMessages(channelID, [commands.getSpellString(dndSpellCache[dndSpellHash[msg]])]); return;
	}else if(dndArmorHash[msg]){
		sendMessages(channelID, [commands.getArmorString(dndArmorCache[dndArmorHash[msg]])]); return;
	}else if(msg != "crab" && dndMonsterHash[msg]){
		sendMessages(channelID, commands.getMonsterString(dndMonsterCache[dndMonsterHash[msg]])); return;
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
		var pmComm = commands.pmResponseCache[cmds[0].toLowerCase()];
		if(funcComm){
			if(funcComm.properties.spam == NO || !util.isNoSpamChannel(channelID)){
				if(funcComm.properties.embed == NO){
					var response = ((funcComm.properties.pingsUser == YES) ? util.pingUser(userID) : "") + funcComm.func({user: user, userID: userID, channelID: channelID, message: message,  cmds: cmds, bot: bot});
					
					if(response != NO_RESPONSE){ sendMessages(channelID, [response]); }
				} else {
					funcComm.func({user: user, userID: userID, channelID: channelID, message: message,  cmds: cmds, bot: bot, callback: sendEmbed});
				}
			} else { console.log("Spam command: \"" + cmds[0] + "\" blocked in channel - " + channelID); }
		} else if(pmComm){
			sendMessages(userID, [pmComm.func({user: user, userID: userID, channelID: channelID, message: message})]);
		}
	}
	
	if(/(?:\[\[(\d+)d(\d+)(?:(kh|kl|k|dh|dl|d|>\?|<\?|=\?)(\d+))?(?:(\+|-)(\d+))?\]\])/gmi.test(message)){
		sendMessages(channelID, [util.handleRoll(message)]);
	}
	
	if(/(?:\[\[(\d+)d(\d+)f(\d+)s(\d+)?\]\])/gmi.test(message)){
		sendMessages(channelID, [util.handleCrab(message)]);
	}
});

bot.on("presence", function(user, userID, status, game, event) {
	//console.log(user + " is now: " + status);
});

bot.on("any", function(event) {
	/*console.log(rawEvent)*/ //Logs every event
});

bot.on("disconnect", function() {
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