/* Statics */
var NO_RESPONSE = "NO_RESPONSE";

var util = require('../util/util');
var cache = require('../cache/cache');
var icon = require("../repo/icon.json");
var auth = require("../auth/auth.json");

/* Bitwise flags */
var FLAGS = {NONE: 0, SPAM: 1, PING: 2, EMBD: 4, PICT: 8, PM: 16, SELF: 32}

/* Function input requests */
var PERMS = {NONE: 0, UID: 1, CHID: 2, MSGID: 4, BOT: 8}

/**
This requires texlive, texlive-latex-extra, and imagemagick to be installed.
Note that imagemagick additionally requires file permissions setups.

See https://stackoverflow.com/questions/42928765/convertnot-authorized-aaaa-error-constitute-c-readimage-453
**/
var mathmode = require("mathmode");
var fs = require("fs");

var request = require('request');

module.exports = {
	/* Response Cache as a catch-all for commands in brackets. */
	functionResponseCache: {
		"help": {
			usage: "[[help]]",
			desc: "-Shows all available commands & usage.",
			permissions: PERMS.UID,
			flags: FLAGS.SELF | FLAGS.EMBD | FLAGS.PM,
			func: function(_msg) {
				if(!this.savedResponse){ this.savedResponse = this.generateHelpResponse(_msg.cmdsArr); }
				for(var i = 0; i < this.savedResponse.length; i++){ _msg.callback(_msg.userID, this.savedResponse[i]); }
			},
			generateHelpResponse: function(_cmds){
				var messages = []
				
				messages.push({
					color: 9997003,
					title: 'Exact Commands',
					fields: [	{name: "do it for him", value: "-Please do it for him."},
								{name: "i swear officer", value: "-Believe me!"},
								{name: "<Any Spell>", value: "-Prints the entry for the DnD5e spell."},
								{name: "<Any Weapon>", value: "-Prints the entry for the DnD5e weapon."},
								{name: "<Any Armor>", value: "-Prints the entry for the DnD5e armor."},
								{name: "<Any Creature>", value: "-Prints the entry for the DnD5e creature.\n-(Except the Crab, who is very, very special.)"},
								{name: "weapons", value: "-Shows the handbook table for DnD5e weapons."},
								{name: "armors", value: "-Shows the handbook table for DnD5e armors."}]
				});
				
				var res = {
					color: 9997003,
					title: 'Inline Commands',
					fields: []
				}
				
				for(var cmd in _cmds){ res.fields.push({name: _cmds[cmd].usage, value: _cmds[cmd].desc}); }
				messages.push(res);
				return messages;
			},
			savedResponse: null
		},
		"fflogsranks": {
			usage: "[[fflogsranks,<character name>,<world>]]",
			desc: "-Searches up a FFXIV character's parses for the current raid tier.",
			permissions: PERMS.CHID,
			flags: FLAGS.EMBD,
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
			usage: "[[wolfram,<wolfram alpha query>]]",
			desc: "-You wanna search wolfram, but too lazy to open your browser?",
			permissions: PERMS.CHID,
			flags: FLAGS.EMBD,
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
				
				var pod, pods = message.queryresult.pods;
				
				for(var i = 0; i < pods.length; i++){
					pod = pods[i];
					if(pod.subpods[0].plaintext == ""){ continue; }
					if(pod.primary){ res.image = { url: pods[i].subpods[0].img.src } }
					res.fields.push({
						name: pod.title,
						value: pod.subpods[0].plaintext
					});
				}
				
				return res;
			}
		},
		"dragsnipe": {
			usage: "[[dragsnipe,<target rate>,<number of rolls>(,<starting rate>,<current rate>)]]",
			desc: "-Returns the chances you have of sniping a particular unit in Dragalia.\n" +
					"--Target rate is in % and is the rate of what you want with no pity rate.\n" +
					"--Starting rate is in % and it is the rate before any pity.\n" +
					"--Current rate is in % and it is the pity rate at which you want to start.\n" +
					"--If starting rate is omitted, it defaults to 4%.\n" +
					"--If current rate is omitted, it defaults to the starting rate.\n" +
					"--Ex. [[dragsnipe,0.5,300]] | [[dragsnipe,0.5,450,6,7.5]].",
			permissions: PERMS.NONE,
			flags: FLAGS.PING,
			func: function(_msg) {
				if(	!/^(?:(?:\d(?:\.\d+)?)|(?:\d?(?:\.\d+)))$/.test(_msg.cmds[1]) || _msg.cmds[1] <= 0 || _msg.cmds[1] > 4 && (!_msg.cmds[3] || _msd.cmds[1] > _msg.cmds[3]) || !/^\d+$/.test(_msg.cmds[2]) || _msg.cmds[3] && (!/^\d(?:\.(?:5|0))?$/.test(_msg.cmds[3]) || _msg.cmds[3] > 9) || _msg.cmds[4] && (!/^\d(?:\.(?:5|0))?$/.test(_msg.cmds[4]) || _msg.cmds[4] < _msg.cmds[3] || _msg.cmds[4] > 9)){
					return "Improper usage, please check the manual or make sure that your inputs are possible. \"[[help]]\"";
				}
				if(_msg.cmds[2] > 50000){ return "Show me a wallet that big and I'll show you a prolapsed anus."; }
				
				return "```With a target rate of " + _msg.cmds[1] + "% and " + _msg.cmds[2] + " rolls costing " + _msg.cmds[2] * 150 + " wyrmite and a starting rate of " + (_msg.cmds[3] ? _msg.cmds[3] : 4) + " and a current rate of " + (_msg.cmds[4] ? _msg.cmds[4] : (_msg.cmds[3] ? _msg.cmds[3] : 4)) + "%\nYou have a " + this.atLeastOneSuccess(_msg.cmds[1] / 100, _msg.cmds[2], (_msg.cmds[3] ? _msg.cmds[3] : 4) / 100, (_msg.cmds[4] ? _msg.cmds[4] : (_msg.cmds[3] ? _msg.cmds[3] : 4)) / 100) * 100 + "% chance of sniping that particular unit.```";
			},
			probHash: [],
			aLOHash: [],
			binHash: [],
			rHash: [],
			fullRate: 0.04,
			pityStep: 0.005,
			pityCap: 0.09,
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
			getPity: function(realRate, fullRate){
				if(realRate < fullRate){ return -1; }
				if(realRate > this.pityCap){ realRate = this.pityCap }
			
				return Math.round((realRate - fullRate) / this.pityStep);
			},
			atLeastOneSuccess: function(baseP, r, fullRate, realRate){
				var pity = this.getPity(realRate, fullRate);
				for(var i = 10000 + (r % 10); i < r; i += 10000){ this.aLOS(pity, baseP, i, fullRate); }
				return this.aLOS(pity, baseP, r, fullRate);
			},
			aLOS: function(pity, baseP, r, fullRate){
				if(r == 0){ return 0; }
				fullRate = fullRate ? fullRate : this.fullRate;
				if(pity == 0 && r < 10){ return this.constructProb(baseP, r, 1) }
				var key = this.getKey([pity, baseP, r, fullRate]), rKey = this.getKey([pity, baseP, r < 10, fullRate]), rate = ((pity * this.pityStep) + fullRate) / fullRate, probOne, probOneBad, isPityCap = this.pityCap > this.pityStep * pity + fullRate;
				if(this.aLOHash[key]){ return this.aLOHash[key]; }

				//oops.
				probOne = this.rHash[rKey] ? this.rHash[rKey][0] : (!isPityCap ? (baseP / fullRate) : 0) + (!isPityCap ? (1 - (baseP / fullRate)) : 1) * this.constructProb(baseP * rate, (!isPityCap ? 9 : (r < 10 ? 1 : 10)), 1);
				probOneBad = this.rHash[rKey] ? this.rHash[rKey][1] : (this.constructProb(fullRate * rate, (r < 10 ? 1 : 10), 1) - probOne) / (1 - probOne);
				this.rHash[rKey] = [probOne, probOneBad];

				return this.aLOHash[key] = probOne + (1 - probOne) * (!isPityCap ? this.aLOS(0, baseP, r - (r < 10 ? 1 : 10), fullRate) : ((1 - probOneBad) * this.aLOS(pity + (r < 10 ? 0 : 1), baseP, r - (r < 10 ? 1 : 10), fullRate) + probOneBad * this.aLOS(0, baseP, r - (r < 10 ? 1 : 10), fullRate)));;
			}
		},
		"latex": {
			usage: "[[latex,<mathematical expression in latex syntax>]]",
			desc: "-Latex formatted text at your command!",
			permissions: PERMS.CHID | PERMS.BOT,
			flags: FLAGS.NONE,
			func: function(_msg) {
				try{
					var rnd = Math.round(Math.random() * 1000000);
					var tmp = fs.createWriteStream(rnd + '.jpg');
					var stream = mathmode(_msg.cmds[1]).pipe(tmp);
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
			usage: "[[honk]]",
			desc: "-Honk Honk.",
			permissions: PERMS.NONE,
			flags: FLAGS.SPAM,
			func: function(_msg) {
				return 	"```\n"+
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
						"⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⠁⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⢀⡼⡾⢀⢀⣼⠓⠢⠦⠤⠤⠠⢀⠰⠊⠁⠊⢀⠡⠾⠋⢀⢀⠇\n```";
			}
		},
		"everyfuckingtime": {
			usage: "[[everyfuckingtime]]",
			desc: "-Oh no.",
			permissions: PERMS.NONE,
			flags: FLAGS.SPAM,
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
			usage: "[[domt]]",
			desc: "-Draws a random card from the Deck of Many Things.",
			permissions: PERMS.NONE,
			flags: FLAGS.SPAM | FLAGS.PING,
			func: function(_msg) {
				card = Math.floor(Math.random() * 22);
				return "You drew " + util.getDNDCardName(card) + "." + "\n" + cache.domtCache[util.getDNDCardName(card).toLowerCase()];
			}
		},
		"domtlist": {
			usage: "[[domtlist]]",
			desc: "-Shows all possible cards from the Deck of Many Things.",
			permissions: PERMS.NONE,
			flags: FLAGS.NONE,
			func: function(_msg) {
				return "Vizier, Sun, Moon, Star, Comet, The Fates, Throne, Key, Knight, Gem, Talons, The Void, Flames, Skull, Idiot, Donjon, Ruin, Euryale, Rogue, Balance, Fool, Jester";
			}
		},
		"tarotcard": {
			usage: "[[tarotcard]]",
			desc: "-Draws a random tarot card.",
			permissions: PERMS.NONE,
			flags: FLAGS.SPAM | FLAGS.PING,
			func: function(_msg) {
				return "You drew " + this.getTarotCardName(Math.floor(Math.random() * 22)) + ".";
			},
			getTarotCardName: function(card){
				return cache.tarotCache[card % cache.tarotCache.length];
			}
		},
		"card": {
			usage: "[[card]]",
			desc: "-Draws a random card.",
			permissions: PERMS.NONE,
			flags: FLAGS.SPAM | FLAGS.PING,
			func: function(_msg) {
				card = Math.floor(Math.random() * this.deckSize);
				return "You drew a " + this.getCardName(card) + " of " + this.getCardSuit(card) + ".";
			},
			deckSize: 52,
			getCardName : function(card){
				return cache.cardNameCache[card % cache.cardNameCache.length];
			},
			getCardSuit : function(card){
				return cache.cardSuitCache[card % cache.cardSuitCache.length];
			}
		},
		"rollstats": {
			usage: "[[rollstats]]",
			desc: "-Rolls stats for a new DnD character.",
			permissions: PERMS.NONE,
			flags: FLAGS.SPAM | FLAGS.PING,
			func: function(_msg) {
				return util.rollStats("[[4d6kh3]][[4d6kh3]][[4d6kh3]][[4d6kh3]][[4d6kh3]][[4d6kh3]]")
			}
		},
		"rollchar": {
			usage: "[[rollchar]]",
			desc: "-Rolls stats, race, and class for a new DnD character.",
			permissions: PERMS.NONE,
			flags: FLAGS.SPAM | FLAGS.PING,
			func: function(_msg) {
				return util.getClassName(Math.floor(Math.random() * cache.classCache.length)) + " & " + util.getRaceName(Math.floor(Math.random() * cache.raceCache.length))+util.rollStats("[[4d6kh3]][[4d6kh3]][[4d6kh3]][[4d6kh3]][[4d6kh3]][[4d6kh3]]")
			}
		},
		"8ball": {
			usage: "[[8ball]]",
			desc: "-Let your deepest, most intimate questions be answered.",
			permissions: PERMS.NONE,
			flags: FLAGS.SPAM | FLAGS.PING,
			func: function(_msg) {
				return cache.fortuneCache[Math.floor(Math.random() * cache.fortuneCache.length)];
			}
		},
		"playing": {
			usage: "[[playing,<game>]]",
			desc: "-Sets the game the bot is currently playing, if your name starts with Arch and ends with aic (and the bot likes you).",
			permissions: PERMS.UID | PERMS.BOT,
			flags: FLAGS.NONE,
			func: function(_msg) {
				if(_msg.userID == 157212139344494592){
					_msg.bot.setPresence({game : {name : _msg.cmds[1]}});
				}
				
				return NO_RESPONSE;
			}
		},
		"avatar": {
			usage: "[[avatar,<icon name>]]",
			desc: "-Sets the icon of the bot, if you have permission.",
			permissions: PERMS.UID | PERMS.BOT,
			flags: FLAGS.NONE,
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
			usage: "[[react,<probability>]]",
			desc: "-Sets the reaction chance.",
			permissions: PERMS.CHID | PERMS.UID | PERMS.MSGID | PERMS.BOT,
			flags: FLAGS.NONE,
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
			usage: "[[lottery]]",
			desc: "-You feeling lucky? Ask Star for details.",
			permissions: PERMS.NONE,
			flags: FLAGS.PING,
			func: function(_msg) {
				return util.handleRoll("[[2d1000]]")
			}
		},
		"info":{
			usage: "[[info]]",
			desc: "-Bot information.",
			permissions: PERMS.NONE,
			flags: FLAGS.NONE,
			func: function(_msg){
				return this.infoResponse.content;
			},
			infoResponse: {
				content: "```\nr9k-ic bot by Archaic.\nLast Updated: 03-28-2019\nver. 1.40\n```"
			}
		},
		"changelog":{
			usage: "[[changelog]]",
			desc: "-Bot changelog.",
			permissions: PERMS.NONE,
			flags: FLAGS.NONE,
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
							"\nver. 1.35:\t02-09-2019\n\tAdded latex & initial refactor.\n" +
							"\nver. 1.40:\t03-28-2019\n\tComplete overhaul of functions & parameters. Help function update. Dragsnipe update.\n" +
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
			info.name + " - Weapon: " + (info.simple == "YES" ? "Simple," : "Martial,") + " " + (info.ranged == "YES" ? "Ranged" : "Melee") +
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
