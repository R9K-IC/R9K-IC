var Discord = require('discord.io');
var repository = './repo/';
var util = require('./util/util');
var commands = require('./cmds/cmds');
var cache = require('./cache/cache');

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

// Get the wolfram alpha client.
try {
	var wolfram = require('wolfram-alpha').createClient("H9GWLU-HK2G84W5A7");
	
	wolfram.query("integrate 2x", function(_e, result) {
		if(_e){ throw _e; }
		console.log("Result: " + result);
	});
} catch (e){
	console.log("No Wolfram Alpha Connection."+e.stack);
}

// Get icon data for changing icons.
try {
	var icon = require(repository+"icon.json");
} catch (e){
	console.log("No icon.JSON file.\n"+e.stack);
}

// Get auth data for login.
try {
	var auth = require("./auth/auth.json");
} catch (e){
	console.log("No auth.JSON file.\n"+e.stack);
	process.exit();
}

var bot = new Discord.Client({
	token: auth.token,
	autorun: true
});

/* Statics */
var YES = "YES";
var NO = "NO";
var NO_RESPONSE = "NO_RESPONSE";

/* Response Array */

var picResponseCache = {
	"i swear officer": repository+"twenty.png",
	"do it for him": repository+"morality.jpg",
	"weapons": repository+"weapons.png",
	"armors": repository+"armors.png",
	"karaoke": repository+"wayde_stay_night.jpg",
	"wade": repository+"wade_stay_night.jpg",
	"wayde": repository+"wayde_stay_night.jpg",
	"direct crit full thrust": repository+"wayde_stay_night.jpg",
	"!pazuzu": repository+"wayde_stay_night.jpg",
	"how goes the wayding": repository+"wayde_stay_night.jpg"
};

/* Saves Servers "Info only" */

var infoServers = {
	"165998917270503424": YES
}

/*Event area*/

bot.on("ready", function(event) {
	console.log("Connected!");
	console.log("Logged in as: ");
	console.log(bot.username + " - (" + bot.id + ")");
});

bot.on("messageUpdate", function(event) {
	console.log(event);
	console.log("caught edit!");
});

bot.on("message", function(user, userID, channelID, message, event) {
	
	if(userID == bot.id){return;}

	console.log("\n==== New Message ====")
	console.log(user + " - " + userID);
	console.log("in " + channelID);
	console.log(message);
	console.log("----------");

	//Make everything check in lower.
	var msg = message.toLowerCase();
	
	//Save a response chain to send it all in one message.
	var res = "";
	
	//Exclusive section.
	if(picResponseCache[msg]) {
		sendFiles(channelID, [picResponseCache[msg]]);
	}else if(dndWeaponHash[msg]){
		sendMessages(channelID, [commands.getWeaponString(dndWeaponCache[dndWeaponHash[msg]])]);
	}else if(dndArmorHash[msg]){
		sendMessages(channelID, [commands.getArmorString(dndArmorCache[dndArmorHash[msg]])]);
	}else if(msg != "crab" && dndMonsterHash[msg]){
		sendMessages(channelID, commands.getMonsterString(dndMonsterCache[dndMonsterHash[msg]]));
	}
	
	if(dndSpellHash[msg]){
		sendMessages(channelID, util.splitMessage(commands.getSpellString(dndSpellCache[dndSpellHash[msg]]), {prepend: "```", append: "```"}));
	}
	
	//Nonexclusive section.
	
	if (message.includes("my shit up") || message.includes("kys") || message.includes(bot.id)){
		sendMessages(channelID, ["<:fms:249379205840633857>"]);
	}
	
	var re = /(?:\[\[(.*?)\]\])/gmi, cmds;
	while((cmds = re.exec(message)) != null){
		console.log(cmds[1]);
		
		var funcComm = commands.functionResponseCache[cmds[1].toLowerCase()];
		var pmComm = commands.pmResponseCache[cmds[1].toLowerCase()];
		if(funcComm){
			if(funcComm.properties.spam == NO || !util.isNoSpamChannel(channelID)){
				var response = ((funcComm.properties.pingsUser == YES) ? util.pingUser(userID) : "") + funcComm.func(user, userID, channelID, message);
				
				if(response != NO_RESPONSE){ sendMessages(channelID, [response]); }
			} else { console.log("Spam command: \"" + cmds[1] + "\" blocked in channel - " + channelID); }
		} else if(pmComm){
			sendMessages(userID, [pmComm.func(user, userID, channelID, message)]);
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
	console.log(user + " is now: " + status);
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