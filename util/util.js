var cache = require('../cache/cache');

module.exports = {
	pingUser: function(userID){
		return "<@" + userID + "> ";
	},
	reactAtRandom: function(_msg){
		if(Math.random() < reactChance){
			_msg.bot.addReaction(_msg);
		}
	},
	changeReactChance: function(p){
		reactChance = p;
	},
	isNoSpamChannel: function(channelID){
		return noSpamChannels[channelID.toString()];
	},
	//From discord.js
	splitMessage: function(text, { maxLength = 1950, char = '\n', prepend = '', append = '' } = {}) {
	  if (text.length <= maxLength) return [text];
	  const splitText = text.split(char);
	  if (splitText.length === 1) throw new Error('Message exceeds the max length and contains no split characters.');
	  const messages = [''];
	  let msg = 0;
	  for (let i = 0; i < splitText.length; i++) {
		if (messages[msg].length + splitText[i].length + 1 > maxLength) {
		  messages[msg] += append;
		  messages.push(prepend);
		  msg++;
		}
		messages[msg] += (messages[msg].length > 0 && messages[msg] !== prepend ? char : '') + splitText[i];
	  }
	  return messages;
	},
	rollStats: function(message){
		var re = /(?:\[\[(\d+)(d)(\d+)(?:(kh|kl|k|dh|dl|d)(\d+))?(?:(\+|-)(\d+))?\]\])/gmi, rolls, res = "```Markdown\n";
		var statCounter = 0;
		
		while((rolls = re.exec(message)) != null){
			var diceNum = rolls[1], d = rolls[2], rollNum = rolls[3], mod = rolls[4], modNum = rolls[5], add = rolls[6], addNum = rolls[7], numsArr = [], sortArr = [], dropArr = [], sum = (add != null) ? ((add === "+") ? -(-addNum) : -addNum) : 0, swap;

			res += "\n" + diceNum + rolls[2] + rollNum + ((mod != null) ? mod + "" + modNum : "") + ((add != null) ? add + addNum : "") + " [[";

			
			
			for(var i = 0; i < diceNum; i++){
				numsArr[i] = Math.ceil(Math.random() * rollNum);
				dropArr[i] = false;
				sortArr[i] = numsArr[i];
			}
			
			if(mod != null){
				sortArr = sortArr.sort(function(a,b){return a-b;});
				
				if(/dh|kl/.test(mod)){sortArr = sortArr.reverse();}
				modNum = /k/.test(mod) ? diceNum - modNum : modNum;
				
				for(var i = 0; i < modNum; i++){
					for(var j = 0; j < diceNum; j++){
						if(numsArr[j] == sortArr[i] && !dropArr[j]){
							dropArr[j] = true;
							break;
						}
					}
				}
			}
			
			for(var i = 0; i < diceNum; i++){
				sum += dropArr[i] ? 0 : numsArr[i];
				res += (dropArr[i]?"(":"<") + numsArr[i] + (dropArr[i]?")":">") + ((i < diceNum - 1)?"+":((add != null) ? add + addNum : ""));
			}

			res += "]] " + cache.statArr[statCounter] + ": "+sum;
			statCounter++;
		}
		
		res += "```";
		
		return res;
	},
	handleRoll: function(message){
		// Regex Golf!
		var re = /(?:\[\[(\d+)(d)(\d+)(?:(kh|kl|k|dh|dl|d|<\?|>\?|=\?)(\d+))?(?:(\+|-)(\d+))?\]\])/gmi, rolls, res = "```Markdown\n", diceLimit = 500, rollLimit = 1000000000;
		
		while((rolls = re.exec(message)) != null){
			var diceNum = rolls[1], d = rolls[2], rollNum = rolls[3], mod = rolls[4], modNum = rolls[5], add = rolls[6], addNum = rolls[7], numsArr = [], sortArr = [], dropArr = [], sum = (add != null) ? ((add === "+") ? -(-addNum) : -addNum) : 0, swap;
			
			res += "\n" + diceNum + rolls[2] + rollNum + ((mod != null) ? mod + "" + modNum : "") + ((add != null) ? add + addNum : "") + " [[";
			
			if(diceNum > diceLimit || rollNum > rollLimit){
				return "Rolls that high are not supported. Try less than 500 dice or 1 billion in dice values. Keep in mind the character limit in Discord is 2000 and the bot will not post rolls over that limit.";
			}
			
			/* Probability question? */
			if(mod != null  && />\?|<\?|=\?/.test(mod)){
				var probability = getProb(/>\?/.test(mod), modNum, diceNum, rollNum, /=\?/.test(mod));
				return "```Markdown\n" + probability + "% chance to roll equal" + (/=\?/.test(mod) ? "" : (/>\?/.test(mod) ? " or higher" : " or lower")) + " to " + modNum + " on " + diceNum + "d" + rollNum + "\n```";
			}
			
			for(var i = 0; i < diceNum; i++){
				numsArr[i] = Math.ceil(Math.random() * rollNum);
				dropArr[i] = false;
				sortArr[i] = numsArr[i];
			}
			
			if(mod != null){
				sortArr = sortArr.sort(function(a,b){return a-b;});
				
				if(/dh|kl/.test(mod)){sortArr = sortArr.reverse();}
				modNum = /k/.test(mod) ? diceNum - modNum : modNum;
				
				for(var i = 0; i < modNum; i++){
					for(var j = 0; j < diceNum; j++){
						if(numsArr[j] == sortArr[i] && !dropArr[j]){
							dropArr[j] = true;
							break;
						}
					}
				}
			}
			
			for(var i = 0; i < diceNum; i++){
				sum += dropArr[i] ? 0 : numsArr[i];
				res += (dropArr[i]?"(":"<") + numsArr[i] + (dropArr[i]?")":">") + ((i < diceNum - 1)?"+":((add != null) ? add + addNum : ""));
			}

			res += "]] " + "<"+sum+">";
		}
		
		res += "```";
		
		return res;
	},
	handleCrab: function(message){
		// Regex Golf!
		var re = /(?:\[\[(\d+)d(\d+)f(\d+)s(\d+)?\]\])/gmi, rolls, res = "", diceLimit = 500, rollLimit = 1000000000;
		
		while((rolls = re.exec(message)) != null){
			var diceNum = rolls[1], rollNum = rolls[2], fail = rolls[3], success = rolls[4];
			
			if(diceNum > diceLimit || rollNum > rollLimit){
				return "Rolls that high are not supported. Try less than 500 dice or 1 billion in dice values. Keep in mind the character limit in Discord is 2000 and the bot will not post rolls over that limit.";
			}
			
			res += getCrab(diceNum, rollNum, fail, success);
		}
		
		return res;
	},
	getClassName: function(_class){
		return cache.classCache[_class % cache.classCache.length];
	},
	getRaceName: function(race){
		return cache.raceCache[race % cache.raceCache.length];
	},
	getDNDCardName: function(card){
		return cache.dndTarotCache[card % cache.dndTarotCache.length];
	}
};

function getCrab(diceNum, rollNum, fail, success){
	var polyArr = [];
	diceNum = parseInt(diceNum);
	rollNum = parseInt(rollNum);
	fail = parseInt(fail);
	success = parseInt(success);
	
	polyArr[0] = [], polyArr[0][0] = 0, polyArr[0][1] = 0, polyArr[0][2] = 0;
	
	for(var j = 1; j < rollNum + 1; j++){
		(j <= fail) ? polyArr[0][0]++ : (j >= success ? polyArr[0][2]++ : polyArr[0][1]++);
	}
	
	for(var i = 1; i < diceNum; i++){
		polyArr[i] = [];
		
		for(var j = 0; j < 3; j++){
			polyArr[i][j] = polyArr[0][j];
		}
	}
	
	var full = fullPoly(polyArr);
	var pow = Math.pow(rollNum, diceNum);
	
	var res = "```Markdown\n" + diceNum + "d" + rollNum + " where " + fail + " and under are failures and " + success + " and over are successes.\n";
	for(var i = 0; i < full.length; i++){
		if(full[i] != 0){
			res += parseFloat((full[i]/pow*100).toFixed(5)) + "% chance for " + Math.abs(i - diceNum) + (i - diceNum > -1 ? " successes":" failures") + "\n"
		}
	}
	res += "\n```";
	
	return res;
}

function getProb(above, value, diceNum, rollNum, equal){
	var polyArr = [];
	diceNum = parseInt(diceNum);
	rollNum = parseInt(rollNum);
	value = parseInt(value);
	
	for(var i = 0; i < diceNum; i++){
		polyArr[i] = [];
		
		polyArr[i][0] = 0;
		for(var j = 1; j < rollNum + 1; j++){
			polyArr[i][j] = 1;
		}
	}
	
	var full = fullPoly(polyArr);
	
	if(equal){
		if(full[value]){
			return (full[value] / Math.pow(rollNum, diceNum) * 100).toFixed(10);
		}
		else{
			return 0;
		}
	}
	
	var sum = 0;
	
	for(var i = (above ? value : value + 1); i < full.length; i++){
		sum += full[i];
	}
	
	return parseFloat(((above ? sum / Math.pow(rollNum, diceNum) : 1 - sum / Math.pow(rollNum, diceNum)) * 100).toFixed(5));
}

function fullPoly(polyArr){
	var res = polyArr[0];
	
	for(var i = 1; i < polyArr.length; i++){
		res = combinePoly(res, polyArr[i]);
	}
	
	return res;
}

function combinePoly(arr1, arr2){
	var res = [];
	
	for(var i = 0; i < arr1.length + arr2.length - 1; i++){
		res[i] = 0;
	}
	
	for(var i = 0; i < arr1.length; i++){
		for(var j = 0; j < arr2.length; j++){
			res[parseInt(i)+parseInt(j)] += arr1[i] * arr2[j];
		}
	}
	
	return res;
}

/* Statics */
var YES = "YES";
var NO = "NO";
var NO_RESPONSE = "NO_RESPONSE";

/* Saved Channels "Spam or no spam" */
var noSpamChannels = {
	"239477486528888833": NO,
	"253616105875046400": NO,
	"255882364725624833": NO
}

var reactChance = 0.01