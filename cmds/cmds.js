/* Statics */
var YES = "YES";
var NO = "NO";
var NO_RESPONSE = "NO_RESPONSE";

var util = require('../util/util');
var cache = require('../cache/cache');

module.exports = {
	/* PM Cache for messages meant to be in DMChannels */
	pmResponseCache: {
		"help": {
			desc: "-Shows all available commands & usage.",
			properties: {
				spam: NO,
				pingsUser: NO
			},
			func: function(user, userID, channelID, message) {
				return cache.helpResponse.content;
			}
		}
	},
	/* Response Cache as a catch-all for commands in brackets. */
	functionResponseCache: {
		"honk": {
			desc: "-Honk Honk.",
			properties: {
				spam: YES,
				pingsUser: NO
			},
			func: function(user, userID, channelID, message) {
				return 	".\n"+
						"⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢰⣶⣶⢀⣴⣄\n"+
						"⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢸⣿⣿⣿⠟⠋\n"+
						"⢀⢀⢀⢀⢀⣀⡀⢀⢀⢀⢀⢀⣠⣤⣴⣿⣧⢸⣿⣿⣷⣄⡀\n"+
						"⢠⣶⣶⡆⣿⣿⣧⢀⣤⣶⣦⡘⣿⣿⣿⣿⣿⢀⣿⣿⠻⡿⠁⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⣀⡀⢀⢀⢀⢀⡠⠔⠒⠒⠒⠒⠒⠤⢄⡀\n"+
						"⠈⣿⣿⣧⣼⣿⣿⢸⣿⡉⣻⣷⠹⣿⠿⠿⠟⢀⠛⠋⢀⢀⢀⢀⢀⢀⣴⣶⠇⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢠⢃⢻⣷⡤⣀⠊⢀⢀⢀⢀⢀⢀⢀⢀⢀⠈⠐⢤⣄⡀\n"+
						"⢀⢻⣿⣿⡟⢻⣿⡇⠙⠿⠟⠃⣀⣀⢀⢀⢀⢀⢀⢀⢀⢀⢀⣀⣀⢀⣿⣿⣴⣾⠇⢀⢀⢀⢀⢀⢀⢀⢀⡎⣠⣙⡿⡿⢀⢀⡀⢀⢀⢀⢀⢀⢀⢀⣠⣶⣿⡿⠋⢱\n"+
						"⢀⠸⣿⣿⣷⠘⠟⠋⢰⣶⡆⢸⣿⣿⢀⢀⣠⣤⣄⢀⣶⣿⣿⣿⣿⢠⣿⣿⣯⡀⢀⢀⢀⢀⢀⢀⢀⢀⡤⠛⠉⢀⢀⠘⠦⠟⠳⣤⢀⠝⠛⣆⣀⠜⠙⠻⣏⣡⠊⡸⠈⢢\n"+
						"⢀⢀⠈⢀⢀⢀⢀⢀⢸⣿⣧⣼⣿⣿⢀⣼⣿⠛⣿⣷⢿⣿⣿⣿⡇⢸⣿⠛⢿⡿⢀⢀⢀⢀⢀⢀⣴⡱⠆⢀⢀⣠⠦⢴⢿⢀⢀⢀⣿⡤⠒⠦⣄⢀⢀⢀⠈⡎⣰⠃⢀⢀⡇\n"+
						"⢀⢀⢀⢀⢀⢀⢀⢀⢸⣿⡿⠿⣿⣿⢀⠹⣿⣶⡿⠋⠈⠋⠉⠉⠁⠈⠉⢀⢀⠁⢀⢀⢀⢀⢀⡼⢋⣠⡄⢀⢀⠁⡰⠃⢸⢀⢠⣰⠁⠱⡀⢀⠈⢺⡀⢀⢀⢈⠁⣀⢀⠜⡆\n"+
						"⢀⢀⢀⢀⢀⢀⢀⢀⢸⣿⣷⢀⣿⠿⢀⢀⢀⢀⢀⢀⣀⣠⡤⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⠘⠋⠁⢸⢀⢀⡇⡾⠶⣶⡝⡄⢸⡞⡨⠖⢒⣦⡄⢀⡇⢀⢀⠈⠙⠉⢲⠉\n"+
						"⢀⢀⢀⢀⢀⢀⢀⢀⠈⠋⠉⢀⢀⢀⢀⢀⢀⣤⣤⢀⣿⣿⣁⣴⡆⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⡎⠐⢨⣧⢀⢀⣼⡇⠘⢼⣧⡇⢀⢀⣿⡏⠈⡇⢀⢀⢀⢀⡠⢸\n"+
						"⢀⢀⢀⢀⢀⢀⣿⣿⣿⣷⢀⢀⢀⢀⢀⣤⣸⣿⣿⢠⣿⣿⣿⠛⠁⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⠇⠇⣸⣿⣿⣿⣿⡇⢀⢀⣿⣷⣶⣿⣿⣿⢀⡇⢀⡀⠐⠁⠂⢸\n"+
						"⢀⢀⢶⣾⣿⡀⢸⣿⣿⣿⢀⣠⣤⣤⢹⣿⣿⣿⣿⢸⣿⡿⣿⣿⠆⢀⢀⢀⣀⢀⢀⢀⡀⢀⢀⢀⢸⢩⢂⡏⠟⠿⡿⡻⠁⢀⢀⢿⢿⣿⡿⢻⠇⢸⢀⠊⢀⡇⢀⠁⡜\n"+
						"⢀⢀⠈⢿⣿⣿⣿⣿⣿⣿⡆⣿⣭⣿⠇⢿⡿⠿⠿⠘⠛⠁⢀⠉⢀⢀⢀⢼⠟⣉⣭⣲⣬⡂⢀⢀⠘⣴⢿⢀⢀⢀⢀⢀⠂⢀⢀⢀⠁⢀⢀⠈⢀⡾⢀⢀⣼⠁⡀⡸⠁\n"+
						"⢀⢀⢀⠈⢿⣿⣿⡀⢿⣿⣿⠈⠉⠁⢀⢀⢀⢀⢀⢀⢀⢸⣿⣴⡦⢀⢀⡎⢀⣼⣿⣿⡇⣙⠦⣠⢖⠋⠙⠳⣦⣀⢀⢀⢀⢀⠊⠓⠚⠁⢀⢀⢰⢃⠔⣱⣇⠴⠟⠁\n"+
						"⢀⢀⢀⢀⠈⢿⣿⣿⠌⠋⢀⢀⣀⡀⢀⢀⢀⢀⣤⣴⣦⠘⣿⣿⣅⡀⢀⡇⢸⣿⣿⣿⡇⠁⢀⢀⣿⠒⢓⠆⢘⡏⠙⡗⠶⢦⠤⣤⣤⡤⠖⠚⠻⢾⠊⠉⠣⡀⢀⢀⣌⣡⢰⢢\n"+
						"⢀⢀⢀⢀⢀⢀⠉⢀⢀⣤⣶⢸⣿⣧⢀⢀⣤⡘⣿⣿⣿⡆⢿⣿⠿⠁⢀⢳⡈⠻⠿⢿⣇⠤⠴⢾⣷⣶⣾⣛⣛⣓⣚⡓⠒⠛⠶⠴⡏⢀⢀⢀⢀⣤⣷⣶⡆⢱⢀⢀⣿⡏⣸⡿\n"+
						"⢀⢀⢀⢀⢀⢀⢀⢀⢀⢿⣿⣆⣿⣿⡄⣿⣯⣿⠻⠿⠋⠁⠈⠁⢀⢀⢀⢀⠈⣑⣺⠍⠑⠂⢀⢀⠳⣌⣉⣁⡞⢀⢀⡟⠽⠛⠛⠒⠿⢦⣤⢤⢼⣻⢿⠿⠇⢸⢀⢠⣿⢧⣿⠃\n"+
						"⢀⢀⢀⢀⢀⢀⢀⢀⢀⠘⣿⣿⠛⣿⣧⠈⠉⠁⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⣸⢀⢀⣸⠃⢀⢀⢀⢀⢀⢀⠉⠛⠳⠶⠥⢤⠐⠋⣠⣿⣿⣿⠋\n"+
						"⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢹⣿⠆⠘⠉⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢴⠇⢀⢀⠏⢀⠲⠒⠖⠢⠰⠤⠦⢦⠥⠈⠄⠘⢦⡚⠻⡿⠟⠁\n"+
						"⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⠁⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⡼⡾⢀⢀⣼⠓⠢⠦⠤⠤⠠⢀⠰⠊⠁⠊⢀⠡⠾⠋⢀⢀⠇";
			}
		},
		"domt": {
			desc: "-Draws a random card from the Deck of Many Things.",
			properties: {
				spam: YES,
				pingsUser: YES
			},
			func: function(user, userID, channelID, message) {
				card = Math.floor(Math.random() * 22);
				return "You drew " + util.getDNDCardName(card) + "." + "\n" + cache.domtCache[util.getDNDCardName(card).toLowerCase()];
			}
		},
		"domtlist": {
			desc: "-Shows all possible cards from the Deck of Many Things.",
			properties: {
				spam: NO,
				pingsUser: NO
			},
			func: function(user, userID, channelID, message) {
				return "Vizier, Sun, Moon, Star, Comet, The Fates, Throne, Key, Knight, Gem, Talons, The Void, Flames, Skull, Idiot, Donjon, Ruin, Euryale, Rogue, Balance, Fool, Jester";
			}
		},
		"tarotcard": {
			desc: "-Draws a random tarot card.",
			properties: {
				spam: YES,
				pingsUser: YES
			},
			func: function(user, userID, channelID, message) {
				return "You drew " + this.getTarotCardName(Math.floor(Math.random() * 22)) + ".";
			},
			tarotCache: {
				0: "The Fool",
				1: "The Magician",
				2: "The High Priestess",
				3: "The Empress",
				4: "The Emperor",
				5: "The Hierophant",
				6: "The Lovers",
				7: "The Chariot",
				8: "Justice",
				9: "The Hermit",
				10: "Wheel of Fortune",
				11: "Strength",
				12: "The Hanged Man",
				13: "Death",
				14: "Temperance",
				15: "The Devil",
				16: "The Tower",
				17: "The Stars",
				18: "The Moon",
				19: "The Sun",
				20: "Judgment",
				21: "The World",
				length: 22
			},
			getTarotCardName: function(card){
				return this.tarotCache[card % this.tarotCache.length];
			}
		},
		"card": {
			desc: "-Draws a random card.",
			properties: {
				spam: YES,
				pingsUser: YES
			},
			func: function(user, userID, channelID, message) {
				card = Math.floor(Math.random() * this.deckSize);
				return "You drew a " + this.getCardName(card) + " of " + this.getCardSuit(card) + ".";
			},
			deckSize: 52,
			cardSuitCache : {
				0: "Spades",
				1: "Clubs",
				2: "Hearts",
				3: "Diamonds",
				length: 4
			},
			cardNameCache : {
				0: "Ace",
				1: "2",
				2: "3",
				3: "4",
				4: "5",
				5: "6",
				6: "7",
				7: "8",
				8: "9",
				9: "10",
				10: "Jack",
				11: "Queen",
				12: "King",
				length: 13
			},
			getCardName : function(card){
				return this.cardNameCache[card % this.cardNameCache.length];
			},
			getCardSuit : function(card){
				return this.cardSuitCache[card % this.cardSuitCache.length];
			}
		},
		"rollstats": {
			desc: "-Rolls stats for a new DnD character.",
			properties: {
				spam: YES,
				pingsUser: YES
			},
			func: function(user, userID, channelID, message) {
				return util.rollStats("[[4d6kh3]][[4d6kh3]][[4d6kh3]][[4d6kh3]][[4d6kh3]][[4d6kh3]]")
			}
		},
		"rollchar": {
			desc: "-Rolls stats, race, and class for a new DnD character.",
			properties: {
				spam: YES,
				pingsUser: YES
			},
			func: function(user, userID, channelID, message) {
				return util.getClassName(Math.floor(Math.random() * cache.classCache.length)) + " & " + util.getRaceName(Math.floor(Math.random() * cache.raceCache.length))+util.rollStats("[[4d6kh3]][[4d6kh3]][[4d6kh3]][[4d6kh3]][[4d6kh3]][[4d6kh3]]")
			}
		},
		"8ball": {
			desc: "-Let your deepest, most intimate question be answered.",
			properties: {
				spam: YES,
				pingsUser: YES
			},
			func: function(user, userID, channelID, message) {
				return this.fortuneCache[Math.floor(Math.random() * this.fortuneCache.length)];
			},
			fortuneCache : {
				0: "Look to La Luna",
				1: "Don't leave the house today",
				2: "We will all die one day",
				3: "You are throwing your life away",
				4: "Go outside!",
				5: "Give up!",
				6: "You will die alone",
				7: "Ask again later",
				8: "Wake up",
				9: "You are worshiping a sun god",
				10: "Stay asleep",
				11: "Marry and reproduce",
				12: "Question authority",
				13: "Think for yourself",
				14: "Steven lives",
				15: "Bring him the photo",
				16: "Your soul is hidden deep within the darkness",
				17: "You were born wrong",
				18: "You are dark inside",
				19: "You will never be forgiven",
				20: "When life gives you lemons, reroll!",
				21: "It is dangerous to go alone",
				22: "Go to the next room",
				23: "You will die",
				24: "Why so blue?",
				25: "Your princess is in another castle",
				26: "You make mistakes, it is only natural",
				27: "A hanged man brings you no luck today",
				28: "The devil in disguise",
				29: "Nobody knows the troubles you have seen",
				30: "Do not look so hurt, others have problems too",
				31: "Always your head in the clouds",
				32: "Do not lose your head",
				33: "Do not cry over spilled tears",
				34: "Well that was worthless",
				35: "Sunrays on your little face",
				36: "Have you seen the exit?",
				37: "Always look on the bright side",
				38: "Get a baby pet, it will cheer you up",
				39: "Meet strangers without prejudice",
				40: "Only a sinner",
				41: "See what he sees, do what he does",
				42: "Lies",
				43: "Lucky numbers: 16 31 64 70 74",
				44: "Go directly to jail",
				45: "Rebirth got cancelled",
				46: "Follow the cat",
				47: "You look fat, you should exercise more",
				48: "Take your medicine",
				49: "Come to a fork in the road, take it",
				50: "Believe in yourself",
				51: "Trust no one",
				52: "Trust good people",
				53: "Follow the dog",
				54: "Follow the zebra",
				55: "What do you want to do today",
				56: "Use bombs wisely",
				57: "Live to die",
				58: "You are playing it wrong, give me the controller",
				59: "Choose your own path",
				60: "Your old life lies in ruin",
				61: "I feel asleep!!!",
				62: "May your troubles be many",
				63: "Blame nobody but yourself",
				64: "WHO ARE YOU PEOPLE?",
				65: "Help, I'm trapped in here!",
				66: "Someone get me out of here!",
				67: "Return to the grave",
				68: "The cat will arrive shortly",
				69: "Please wait",
				70: "Reply hazy, try another reality",
				71: "[[8ball]]",
				72: "You have activated my trap card",
				73: "God willing",
				74: "Night falls",
				75: "Deny everything",
				76: "Everyone else is wrong",
				length: 77
			}
		},
		"playing": {
			desc: "-Sets the game the bot is currently playing, if you have permission.",
			properties: {
				spam: NO,
				pingsUser: NO
			},
			func: function(user, userID, channelID, message) {
				if(userID == 157212139344494592 || userID == 143046791573536769){
					bot.setPresence({game : {name : message.split("[[playing]] ")[1]}});
				}
				
				return NO_RESPONSE;
			}
		},
		"avatar": {
			desc: "-Sets the icon of the bot, if you have permission.",
			properties: {
				spam: NO,
				pingsUser: NO
			},
			func: function(user, userID, channelID, message) {
				if(userID == 157212139344494592){
					if(message == "[[avatar]] bird"){
						bot.editUserInfo({avatar : icon.bird});
					}
					else if (message == "[[avatar]] elf"){
						bot.editUserInfo({avatar : icon.elf});
					}
					else{
						bot.editUserInfo({avatar : icon.cat});
					}
				}
				
				return NO_RESPONSE;
			}
		},
		"lottery": {
			desc: "-You feeling lucky? Ask Star for details.",
			properties: {
				spam: NO,
				pingsUser: YES
			},
			func: function(user, userID, channelID, message) {
				return util.handleRoll("[[2d1000]]")
			}
		},
		"info":{
			desc: "-Bot information.",
			properties: {
				spam: NO,
				pingsUser: NO
			},
			func: function(user, userID, channelID, message){
				return this.infoResponse.content;
			},
			infoResponse: {
				content: "```\nr9k-ic bot by Archaic.\nLast Updated: 09-06-2018\nver. 1.10\n```"
			}
		},
		"changelog":{
			desc: "-Bot changelog.",
			properties: {
				spam: NO,
				pingsUser: NO
			},
			func: function(user, userID, channelID, message){
				return this.changelogResponse.content;
			},
			changelogResponse: {
				content: "```\nver. 1.04:\t01-12-2017\n\tDice probabilities. ([[8d6>?30]])\n" +
							"\nver. 1.05:\t01-18-2017\n\tCrab Feeder. ([[3d10f1s4]])\n" +
							"\nver. 1.06:\t01-24-2017\n\tMonster Lookup. (Ancient Red Dragon)\n" +
							"\nver. 1.10:\t09-06-2018\n\tRemove legacy commands & refactor.\n" +
							"```"
			}
		}
	},
	getSpellString: function(info){
		var res = 	"```\n" +
			info.name +
			(info.level ? "\n" + info.level + " " + info.school: "") +
			(info.casting_time ? "\n\tCasting Time: " + info.casting_time : "") +
			(info.range ?		 "\n\tRange       : " + info.range : "") +
			(info.components ?	 "\n\tComponents  : " + info.components + (info.material ? " (" + info.material + ")" : "" ) : "") +
			(info.duration ?	 "\n\tDuration    : " + info.duration : "") +
			(info.desc ? 		 "\n\t\t"+info.desc : "");
		res += "```"
		return res;
	},
	getArmorString: function(info){
		var res = 	"```\n" +
			info.name + (info.type ? " - Armor: " + info.type : "") +
			(info.cost   ? 			"\n\tCost           : " + info.cost + "gp" : "") +
			(info.ac   ?   			"\n\tArmor Class    : " + info.ac : "") +
			(info.strength_req   ?  "\n\tStr Requirement: " + info.strength_req : "") +
			(info.stealth   ?   	"\n\tStealth        : " + info.stealth : "") +
			(info.weight ? 			"\n\tWeight         : " + info.weight + "lb." : "");
		res += "```"
		return res;
	},
	getWeaponString: function(info){
		
		var res = 	"```\n" +
			info.name + " - Weapon: " + (info.simple == YES ? "Simple," : "Martial,") + " " + (info.ranged == YES ? "Ranged" : "Melee") +
			(info.cost   ? "\n\tCost  : " + info.cost + "gp" : "") +
			(info.damage ? "\n\tDamage: " + info.damage + " " + info.damage_type : "") +
			(info.weight ? "\n\tWeight: " + info.weight + "lb." : "");
		
		var i = 0;
		if(info.properties[0] != null){
			res += "\n\tProperties: ";
		}
		
		while(info.properties[i] != null){
			res += "-" + info.properties[i] + (info.properties[i+1] ? "\n\t\t\t\t" : "");
			i++
		}
		
		res += "```"
		return res;
	},
	getMonsterString: function(info){
		
		console.log(info);
		
		var res1 = 	"```\n" +
			info.name +
			(info.size   	?"\n\tSize      : " + info.size: "") +
			(info.type	 	?"\n\tType      : " + info.type: "") +
			(info.alignment	?"\n\tAlignment : " + info.alignment: "") +
			(info.ac		?"\n\tAC        : " + info.ac: "\n") +
			(info.hp		?"\n\tHP        : " + info.hp: "") +
			(info.speed		?"\n\tSpeed     : " + info.speed: "") +
			(info.str		?"\n\tSTR       : " + info.str + " | ": "") +
			(info.dex		?    "DEX : " + info.dex + " | ": "") +
			(info.con		?    "CON : " + info.con + " | ": "") +
			(info.int		?    "INT : " + info.int + " | ": "") +
			(info.wis		?    "WIS : " + info.wis + " | ": "") +
			(info.cha		?    "CHA : " + info.cha: "") +
			(info.save		?"\n\tSaves     : " + info.save : "") +
			(info.skill		?"\n\tSkill     : " + info.skill : "") +
			(info.resist	?"\n\tResists   : " + info.resist : "") +
			(info.vulnerable?"\n\tVuln.     : " + info.vulnerable : "") +
			(info.immune	?"\n\tImmunities: " + info.immune : "") +
	(info.conditionImmune	?"\n\tCond. Imm.: " + info.conditionImmune : "") +
			(info.senses	?"\n\tSenses    : " + info.senses + " | ": "") +
			(info.passive	?"Passive Perception : " + info.passive : "") +
			(info.languages	?"\n\tLanguages : " + info.languages : "") +
			(info.cr		?"\n\tCR        : " + info.cr : "");
		res1 += "```";
		
		var i = 0;
		var res2 = "";
		if(info.trait != null){
			res2 += "```\nTraits:\n\t";
			while(info.trait[i] != null){
				res2 += "-" + info.trait[i].name + ": " + info.trait[i].text + (info.trait[i+1] ? "\n\t" : "");
				i++;
			}
			if(!(info.trait instanceof Array)){
				res2 += "-" + info.trait.name + ": " + info.trait.text;
				i++;
			}
			res2 += "\n```";
		}
		
		i = 0;
		var res3 = "";
		if(info.action != null){
			res3 += "```\nActions:\n\t"; 
			while(info.action[i] != null){
				res3 += "-" + info.action[i].name + ": " + info.action[i].text + (info.action[i+1] ? "\n\t" : "");
				i++;
			}
			if(!(info.action instanceof Array)){
				res3 += "-" + info.action.name + ": " + info.action.text;
				i++;
			}
			res3 += "\n```";
		}
		
		i = 0;
		var res4 = "";
		if(info.legendary != null){
			res4 += "```\nLegendary Actions:\n\t";
			while(info.legendary[i] != null){
				res4 += "-" + info.legendary[i].name + ": " + info.legendary[i].text + (info.legendary[i+1] ? "\n\t" : "");
				i++;
			}
			if(!(info.legendary instanceof Array)){
				res2 += "-" + info.legendary.name + ": " + info.legendary.text;
				i++;
			}
			res4 += "\n```";
		}
		
		return util.splitMessage(res1, {prepend: "```", append: "```"}).concat(
				util.splitMessage(res2, {prepend: "```", append: "```"})).concat(
				util.splitMessage(res3, {prepend: "```", append: "```"})).concat(
				util.splitMessage(res4, {prepend: "```", append: "```"}));
	}
};