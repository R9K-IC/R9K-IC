/* Statics */
var YES = "YES";
var NO = "NO";
var NO_RESPONSE = "NO_RESPONSE";

var util = require('../util/util');
var cache = require('../cache/cache');
var icon = require("../repo/icon.json");
var auth = require("../auth/auth.json");

/**
This requires texlive, texlive-latex-extra, and imagemagick to be installed.
Note that imagemagick additionally requires file permissions setups.

See https://stackoverflow.com/questions/42928765/convertnot-authorized-aaaa-error-constitute-c-readimage-453
**/
var mathmode = require("mathmode");
var fs = require("fs");

var request = require('request');

module.exports = {
	/* PM Cache for messages meant to be in DMChannels */
	pmResponseCache: {
		"help": {
			desc: "-Shows all available commands & usage.",
			properties: {
				spam: NO,
				pingsUser: NO,
				embed: NO
			},
			func: function(_msg) {
				return cache.helpResponse.content;
			}
		}
	},
	/* Response Cache as a catch-all for commands in brackets. */
	functionResponseCache: {
		"fflogsranks": {
			desc: "-TODO.",
			properties: {
				spam: NO,
				pingsUser: NO,
				embed: YES
			},
			func: function(_msg) {
				console.log("1: "+_msg.cmds + "0: " + _msg.cmds[0]);
				console.log(this.constructRequestURL(_msg.cmds[1], _msg.cmds[2], "na"));
				request(this.constructRequestURL(_msg.cmds[1], _msg.cmds[2], "na"), { json: true }, (err, res, body) => {
					try{
						if(err) { return console.log(err); }
						if(body.status){ throw "help"; }
						var res = this.constructEmbed(body);
						_msg.callback(_msg.channelID, res);
					} catch(e){
						_msg.callback(_msg.channelID, { color: 3447003, title: "TODO" });
					}
				});
			},
			fflogsKey: '?api_key='+auth.fflogsAPItoken,
			historical: '&timeframe=historical',
			fflogsBase: 'https://www.fflogs.com:443/v1/',
			constructRequestURL: function(character, server, region){
				var res = this.fflogsBase;
				res += 'rankings/character/';
				res += character + '/';
				res += server + '/';
				res += region;
				res += this.fflogsKey + '&';
				res += this.historical;

				return res;
			},
			constructEmbed: function(message){
				var res = {
					color: 3447003,
					title: message[0].characterName,
					url: "http://fflogs.com/character/na/" + message[0].server + "/" + message[0].characterName.replace(" ", "%20"),
					fields: [],
					timestamp: new Date()
				}
				console.log(res);

				var fight;
				
				for(var i = 0; i < message.length; i++){
					fight = message[i];
					res.fields.push({
						name: fight.encounterName + ", " + fight.spec,
						value: parseFloat((100 - (fight.rank / fight.outOf * 100)).toFixed(2)) + "% " +  fight.total + " DPS"
					});
				}
				
				return res;
			}
		},
		"wolfram": {
			desc: "-TODO.",
			properties: {
				spam: NO,
				pingsUser: NO,
				embed: YES
			},
			func: function(_msg) {
				console.log("1: " + _msg.cmds + "0: " + _msg.cmds[0]);
				console.log(this.constructRequestURL(_msg.cmds[1]));
				this.request = _msg.cmds[1];
				request(this.constructRequestURL(_msg.cmds[1]), { json: true }, (err, res, body) => {
					try{
						if(err) { return console.log(err); }
						if(body.status){ throw "help"; }
						var res = this.constructEmbed(body);
						_msg.callback(_msg.channelID, res);
					} catch(e){
						_msg.callback(_msg.channelID, { color: 3447003, title: "TODO" });
					}
				});
			},
			wolframKey: '?appid=' + auth.wolframAPItoken,
			stepbystep: '&podstate=Step-by-step%20solution',
			output: '&output=json',
			input: '&input=',
			request,
			temp: '&podtitle=Input%20interpretation&podtitle=Result',
			//wolframBase: 'http://api.wolframalpha.com/v1/simple',
			wolframBase: 'http://api.wolframalpha.com/v2/query',
			wolframLink: 'https://www.wolframalpha.com/input/?i=',
			constructRequestURL: function(request){
				var res = this.wolframBase;
				res += this.wolframKey;
				res += this.input + encodeURIComponent(request);
				res += this.stepbystep;
				res += this.output;

				return res;
			},
			constructEmbed: function(message){
				
				var res = {
					color: 9997003,
					title: this.request,
					url: this.wolframLink + encodeURIComponent(this.request),
					fields: [],
					timestamp: new Date()
				}
				
				//console.log(res);
				var pod, pods = message.queryresult.pods;
				//console.log(pods);
				
				for(var i = 0; i < pods.length; i++){
					pod = pods[i];
					if(pod.subpods[0].plaintext == ""){ continue; }
					if(pod.primary){ res.image = { url: pods[i].subpods[0].img.src } }
					res.fields.push({
						name: pod.title,
						value: pod.subpods[0].plaintext
					});
				}
				
				/*
				console.log(message.imageFile);
				var res = {
					color: 9997003,
					title: decodeURI(this.request),
					url: this.wolframLink + this.request,
					fields: [],
					image: {
						url: 'data:image/gif;base64,' + new Buffer(message.imageFile).toString('base64')
					},
					timestamp: new Date()
				}
				
				console.log(res.image.url);
				*/
				return res;
			}
		},
		"dragsnipe": {
			desc: "-Returns the chances you have of sniping a particular unit in Dragalia.",
			properties: {
				spam: NO,
				pingsUser: YES,
				embed: NO
			},
			func: function(_msg) {
				if(	!/^(?:(?:\d(?:\.\d+)?)|(?:\d?(?:\.\d+)))$/.test(_msg.cmds[1]) || _msg.cmds[1] <= 0 || _msg.cmds[1] > 4 || !/^\d+$/.test(_msg.cmds[2]) || _msg.cmds[3] && !/^\d(?:\.(?:5|0))?$/.test(_msg.cmds[3])){
					return "Improper usage, please check the manual. \"[[help]]\"";
				}
				if(_msg.cmds[2] > 50000){ return "Show me a wallet that big and I'll show you a prolapsed anus."; }
				
				return "```With a base rate of " + _msg.cmds[1] + "% and " + _msg.cmds[2] + " rolls costing " + _msg.cmds[2] * 150 + " wyrmite and a starting pity rate of " + (_msg.cmds[3] ? _msg.cmds[3] : 4) + "%\nYou have a " + this.atLeastOneSuccess(_msg.cmds[3] ? (_msg.cmds[3] - 4) / 0.5 : 0, _msg.cmds[1] / 100, _msg.cmds[2]) * 100 + "% chance of sniping that particular unit.```";
			},
			probHash: [],
			aLOHash: [],
			binHash: [],
			rHash: [],
			getKey: function(arr){ return arr.join("|") },
			binomial: function(n, r){
				var key = this.getKey([n, r]), res = 1, r = n - r > r ? r : n - r;
				if(this.binHash[key]){ return this.binHash[key]; }
				for(var i = 0; i < r; i++){ res *= n - i; res /= i + 1; }
				return this.binHash[key] = res;
			},
			constructProb: function(p, r, s){
				var key = this.getKey([p, r, s]), res = 1;
				if(this.probHash[key]){ return this.probHash[key]; }
				for(var i = 0; i < s; i++){ res -= this.binomial(r, i) * Math.pow(1 - p, r - i) * Math.pow(p, i); }
				return this.probHash[key] = res;
			},
				atLeastOneSuccess: function(pity, baseP, r){
				if(r == 0){ return 0; }
				if(pity == 0 && r < 10){ return this.constructProb(baseP, r, 1) }
				var key = this.getKey([pity, baseP, r]), rKey = this.getKey([pity, baseP, r < 10]), res = 0, rate = ((pity * 0.005) + 0.04) / 0.04, probOne, probOneBad;
				if(this.aLOHash[key]){ return this.aLOHash[key]; }

				//oops.
				probOne = this.rHash[rKey] ? this.rHash[rKey][0] : (pity > 9 ? (baseP / 0.04) : 0) + (pity > 9 ? (1 - (baseP / 0.04)) : 1) * this.constructProb(baseP * rate, (pity > 9 ? 9 : (r < 10 ? 1 : 10)), 1);
				probOneBad = this.rHash[rKey] ? this.rHash[rKey][1] : (this.constructProb(0.04 * rate, (r < 10 ? 1 : 10), 1) - probOne) / (1 - probOne);
				this.rHash[rKey] = [probOne, probOneBad];
				res += probOne + (1 - probOne) * (pity > 9 ? this.atLeastOneSuccess(0, baseP, r - (r < 10 ? 1 : 10)) : ((1 - probOneBad) * this.atLeastOneSuccess(pity + (r < 10 ? 0 : 1), baseP, r - (r < 10 ? 1 : 10)) + probOneBad * this.atLeastOneSuccess(0, baseP, r - (r < 10 ? 1 : 10))));

				return this.aLOHash[key] = res;
			}
		},
		"latex": {
			desc: "-Latex formatting",
			properties: {
				spam: NO,
				pingsUser: NO,
				embed: NO
			},
			func: function(_msg) {
				try{
					var rnd = Math.round(Math.random() * 1000000);
					var tmp = fs.createWriteStream(rnd + '.jpg');
					var reconstruct = _msg.cmds[1];
					for(var i = 2; i < _msg.cmds.length; i++){reconstruct += ',' + _msg.cmds[i]}
					var stream = mathmode(reconstruct).pipe(tmp);
					stream.on('finish', function(){
						_msg.bot.uploadFile({
							to: _msg.channelID,
							file: "./" + rnd + ".jpg"
						});
						fs.unlink("./" + rnd + ".jpg");
					});
				} catch(e){ console.log(e); }
				return NO_RESPONSE;
			}
		},
		"honk": {
			desc: "-Honk Honk.",
			properties: {
				spam: YES,
				pingsUser: NO,
				embed: NO
			},
			func: function(_msg) {
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
		"everyfuckingtime": {
			desc: "-Oh no.",
			properties: {
				spam: YES,
				pingsUser: NO,
				embed: NO
			},
			func: function(_msg) {
				return 	"```\n"+
						"                E V E R Y F U C K I N G T I M E\n"+
						"              / V                           / V\n"+
						"            /   E                         /   E\n"+
						"          /     R                       /     R\n"+
						"        /       Y                     /       Y\n"+
						"      /         F                   /         F\n"+
						"    /           U                 /           U\n"+
						"  /             C               /             C\n"+
						"E V E R Y F U C K I N G T I M E               K\n"+
						"V               I             V               I\n"+
						"E               N             E               N\n"+
						"R               G             R               G\n"+
						"Y               T             Y               T\n"+
						"F               I             F               I\n"+
						"U               M             U               M\n"+
						"C               E V E R Y F U C K I N G T I M E\n"+
						"K             /               K             /\n"+
						"I           /                 I           /\n"+
						"N         /                   N         /\n"+
						"G       /                     G       /\n"+
						"T     /                       T     /\n"+
						"I   /                         I   /\n"+
						"M /                           M /\n"+
						"E V E R Y F U C K I N G T I M E\n```";
			}
		},
		"domt": {
			desc: "-Draws a random card from the Deck of Many Things.",
			properties: {
				spam: YES,
				pingsUser: YES,
				embed: NO
			},
			func: function(_msg) {
				card = Math.floor(Math.random() * 22);
				return "You drew " + util.getDNDCardName(card) + "." + "\n" + cache.domtCache[util.getDNDCardName(card).toLowerCase()];
			}
		},
		"domtlist": {
			desc: "-Shows all possible cards from the Deck of Many Things.",
			properties: {
				spam: NO,
				pingsUser: NO,
				embed: NO
			},
			func: function(_msg) {
				return "Vizier, Sun, Moon, Star, Comet, The Fates, Throne, Key, Knight, Gem, Talons, The Void, Flames, Skull, Idiot, Donjon, Ruin, Euryale, Rogue, Balance, Fool, Jester";
			}
		},
		"tarotcard": {
			desc: "-Draws a random tarot card.",
			properties: {
				spam: YES,
				pingsUser: YES,
				embed: NO
			},
			func: function(_msg) {
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
				pingsUser: YES,
				embed: NO
			},
			func: function(_msg) {
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
				pingsUser: YES,
				embed: NO
			},
			func: function(_msg) {
				return util.rollStats("[[4d6kh3]][[4d6kh3]][[4d6kh3]][[4d6kh3]][[4d6kh3]][[4d6kh3]]")
			}
		},
		"rollchar": {
			desc: "-Rolls stats, race, and class for a new DnD character.",
			properties: {
				spam: YES,
				pingsUser: YES,
				embed: NO
			},
			func: function(_msg) {
				return util.getClassName(Math.floor(Math.random() * cache.classCache.length)) + " & " + util.getRaceName(Math.floor(Math.random() * cache.raceCache.length))+util.rollStats("[[4d6kh3]][[4d6kh3]][[4d6kh3]][[4d6kh3]][[4d6kh3]][[4d6kh3]]")
			}
		},
		"8ball": {
			desc: "-Let your deepest, most intimate question be answered.",
			properties: {
				spam: YES,
				pingsUser: YES,
				embed: NO
			},
			func: function(_msg) {
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
				pingsUser: NO,
				embed: NO
			},
			func: function(_msg) {
				if(_msg.userID == 157212139344494592){
					_msg.bot.setPresence({game : {name : _msg.message.split("[[playing]] ")[1]}});
				}
				
				return NO_RESPONSE;
			}
		},
		"avatar": {
			desc: "-Sets the icon of the bot, if you have permission.",
			properties: {
				spam: NO,
				pingsUser: NO,
				embed: NO
			},
			func: function(_msg) {
				if(_msg.userID == 157212139344494592){
					if(_msg.message == "[[avatar]] bird"){
						_msg.bot.edit_msg.UserInfo({avatar : icon.bird});
					}
					else if (_msg.message == "[[avatar]] elf"){
						_msg.bot.edit_msg.UserInfo({avatar : icon.elf});
					}
					else{
						_msg.bot.edit_msg.UserInfo({avatar : icon.cat});
					}
				}
				
				return NO_RESPONSE;
			}
		},
		"react": {
			desc: "-Sets the reaction chance.",
			properties: {
				spam: NO,
				pingsUser: NO,
				embed: NO
			},
			func: function(_msg) {
				if(_msg.userID == 157212139344494592){
					if(/^(?:(?:\d(?:\.\d+)?)|(?:\d?(?:\.\d+)))$/.test(_msg.cmds[1]) && _msg.cmds[1] >= 0 && _msg.cmds[1] <= 1){
						util.changeReactChance(_msg.cmds[1]);
						_msg.bot.deleteMessage({channelID: _msg.channelID, messageID: _msg.messageID});
					}
					else{
						return "```Invalid Input.```";
					}
				}
				
				return NO_RESPONSE;
			}
		},
		"lottery": {
			desc: "-You feeling lucky? Ask Star for details.",
			properties: {
				spam: NO,
				pingsUser: YES,
				embed: NO
			},
			func: function(_msg) {
				return util.handleRoll("[[2d1000]]")
			}
		},
		"info":{
			desc: "-Bot information.",
			properties: {
				spam: NO,
				pingsUser: NO,
				embed: NO
			},
			func: function(_msg){
				return this.infoResponse.content;
			},
			infoResponse: {
				content: "```\nr9k-ic bot by Archaic.\nLast Updated: 12-09-2018\nver. 1.30\n```"
			}
		},
		"changelog":{
			desc: "-Bot changelog.",
			properties: {
				spam: NO,
				pingsUser: NO,
				embed: NO
			},
			func: function(_msg){
				return this.changelogResponse.content;
			},
			changelogResponse: {
				content: "```\nver. 1.04:\t01-12-2017\n\tDice probabilities. ([[8d6>?30]])\n" +
							"\nver. 1.05:\t01-18-2017\n\tCrab Feeder. ([[3d10f1s4]])\n" +
							"\nver. 1.06:\t01-24-2017\n\tMonster Lookup. (Ancient Red Dragon)\n" +
							"\nver. 1.10:\t09-06-2018\n\tRemove legacy commands & refactor.\n" +
							"\nver. 1.20:\t09-14-2018\n\tAdded FFlogs rankings pulls.\n" +
							"\nver. 1.30:\t12-09-2018\n\tAdded Wolfram Alpha support & dragsnipe.\n" +
							"```"
			}
		}
	},
	getSpellString: function(info){
		var res = {
			color: 9997003,
			title: info.name,
			fields: []
		}
		
		if(info.level){			res.fields.push({name: "Level",			value: info.level + " " + info.school})}
		if(info.casting_time){	res.fields.push({name: "Casting Time",	value: info.casting_time})}
		if(info.range){			res.fields.push({name: "Range",			value: info.range})}
		if(info.components){	res.fields.push({name: "Components",	value: info.components + (info.material ? " (" + info.material + ")" : "" )})}
		if(info.duration){		res.fields.push({name: "Duration",		value: info.duration})}
		if(info.desc){
			var i = 0;
			util.splitMessage(info.desc, {maxLength: 975, char: '.', append: "."}).forEach(function(m) {
				res.fields.push({
					name: i == 0 ? "Description" : "Description cont.",
					value: m
				});
				i++;
			});
		}
console.log(res);
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
		var res = {
			color: 9997003,
			title: info.name,
			fields: []
		}
		
		var res1 = 	"" +
			(info.size   	?"\nSize:     : " + info.size: "") +
			(info.type	 	?"\nType      : " + info.type: "") +
			(info.alignment	?"\nAlignment : " + info.alignment: "") +
			(info.ac		?"\nAC        : " + info.ac: "\n") +
			(info.hp		?"\nHP        : " + info.hp: "") +
			(info.speed		?"\nSpeed     : " + info.speed: "") +
			(info.str		?"\nSTR       : " + info.str + " | ": "") +
			(info.dex		?  "DEX : " + info.dex + " | ": "") +
			(info.con		?  "CON : " + info.con + " | ": "") +
			(info.int		?  "INT : " + info.int + " | ": "") +
			(info.wis		?  "WIS : " + info.wis + " | ": "") +
			(info.cha		?  "CHA : " + info.cha: "") +
			(info.save		?"\nSaves     : " + info.save : "") +
			(info.skill		?"\nSkill     : " + info.skill : "") +
			(info.resist	?"\nResists   : " + info.resist : "") +
			(info.vulnerable?"\nVuln.     : " + info.vulnerable : "") +
			(info.immune	?"\nImmunities: " + info.immune : "") +
	(info.conditionImmune	?"\nCond. Imm.: " + info.conditionImmune : "") +
			(info.senses	?"\nSenses    : " + info.senses + " | ": "\n") +
			(info.passive	?"Passive Perception : " + info.passive : "") +
			(info.languages	?"\nLanguages : " + info.languages : "") +
			(info.cr		?"\nCR        : " + info.cr : "");
		
		res.fields.push({
			name: "Stats",
			value: res1
		});
		
		var i = 0;
		var res2 = "";
		if(info.trait){
			while(info.trait[i] != null){
				res2 += "-" + info.trait[i].name + ": " + info.trait[i].text + (info.trait[i+1] ? "\n" : "");
				i++;
			}
			if(!(info.trait instanceof Array)){
				res2 += "-" + info.trait.name + ": " + info.trait.text;
				i++;
			}
			
			i = 0;
			util.splitMessage(res2, {maxLength: 975}).forEach(function(m) {
				res.fields.push({
					name: i == 0 ? "Traits" : "Traits cont.",
					value: m
				});
				i++;
			});
		}
		
		i = 0;
		var res3 = "";
		if(info.action != null){
			while(info.action[i]){
				res3 += "-" + info.action[i].name + ": " + info.action[i].text + "\n";
				i++;
			}
			if(!(info.action instanceof Array)){
				res3 += "-" + info.action.name + ": " + info.action.text;
				i++;
			}
			
			i = 0;
			util.splitMessage(res3, {maxLength: 975}).forEach(function(m) {
				res.fields.push({
					name: i == 0 ? "Actions" : "Actions cont.",
					value: m
				});
				i++;
			});
		}
		
		i = 0;
		var res4 = "";
		if(info.legendary != null){
			while(info.legendary[i]){
				res4 += "-" + info.legendary[i].name + ": " + info.legendary[i].text + "\n";
				i++;
			}
			if(!(info.legendary instanceof Array)){
				res4 += "-" + info.legendary.name + ": " + info.legendary.text;
			}
			
			i = 0;
			util.splitMessage(res4, {maxLength: 975}).forEach(function(m) {
				res.fields.push({
					name: i == 0 ? "Legendary Actions" : "Legendary Actions cont.",
					value: m
				});
				i++;
			});
		}
		
		return res;
	}
};
