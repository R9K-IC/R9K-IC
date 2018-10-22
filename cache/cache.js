var repository = './repo/';

module.exports = {
	helpResponse: {
		content: 	"Exact commands:\n"+
				"```\n"+
					"Kosher Commands:\n\t"+
						"do it for him\n\t\t"+
							"-Please do it for him.\n\t"+
						"i swear officer\n\t\t"+
							"-Believe me!.\n\t"+
						"[[<Any Deck of Many Things Card>]]\n\t\t"+
							"-Prints the description of the corresponding card.\n\t"+
						"<Any Spell>\n\t\t"+
							"-Prints the entry for the DnD5e spell.\n\t"+
						"<Any Weapon>\n\t\t"+
							"-Prints the entry for the DnD5e weapon.\n\t"+
						"<Any Armor>\n\t\t"+
							"-Prints the entry for the DnD5e armor.\n\t"+
						"<Any Creature>\n\t\t"+
							"-Prints the entry for the DnD5e creature.\n\t"+
							"-(Except the Crab, who is very, very special.)\n\t"+
						"weapons\n\t\t"+
							"-Shows the handbook table for DnD5e weapons.\n\t"+
						"armors\n\t\t"+
							"-Shows the handbook table for DnD5e armors."+
				"```\n"+
					"Inline commands:\n"+
				"```\n"+
					"Kosher Commands:\n\t"+
						"[[help]]\n\t\t"+
							"-Shows all available commands & usage.\n\t"+
						"[[NdN<(kh|kl|k|dh|dl|d)N><(+|-)N>]]\n\t\t"+
							"-Inline roll command. Ex. [[2d20kh1+9]]\n\t"+
						"[[NdN(>?|<?|=?)N]]\n\t\t"+
							"-Inline sum probability command. Ex. [[8d6>?30]]\n\t"+
						"[[NdNfNsN]]\n\t\t"+
							"-Inline success/failure probability command. Ex. [[3d10f1s4]]\n\t"+
						"[[fflogsranks,<character name>,<world>]]\n\t\t"+
							"-TODO.\n\t"+
						"[[lottery]]\n\t\t"+
							"-You feeling lucky? Ask Star for details.\n\t"+
						"[[domtlist]]\n\t\t"+
							"-Shows all possible cards from the Deck of Many Things.\n\t"+
						"my shit up | kys\n\t\t"+
							"-No bully.\n"+
					"\nNon-Kosher Commands:\n\t"+
						"[[honk]]\n\t\t"+
							"-Honk Honk.\n\t"+
						"[[everyfuckingtime]]\n\t\t"+
							"-Oh no.\n\t"+
						"[[domt]]\n\t\t"+
							"-Draws a random card from the Deck of Many Things.\n\t"+
						"[[tarotcard]]\n\t\t"+
							"-Draws a random tarot card.\n\t"+
						"[[card]]\n\t\t"+
							"-Draws a random card.\n\t"+
						"[[rollstats]]\n\t\t"+
							"-Rolls stats for a new DnD character.\n\t"+
						"[[8ball]]\n\t\t"+
							"-Let your deepest, most intimate question be answered.\n\t"+
						"[[rollchar]]\n\t\t"+
							"-Rolls stats, race, and class for a new DnD character."+
				"```\n",
	},
	picResponseCache: {
		"i swear officer": repository+"twenty.png",
		"do it for him": repository+"morality.jpg",
		"weapons": repository+"weapons.png",
		"armors": repository+"armors.png",
		"karaoke": repository+"wayde_stay_night.jpg",
		"wade": repository+"wade_stay_night.jpg",
		"wayde": repository+"wayde_stay_night.jpg",
		"direct crit full thrust": repository+"wayde_stay_night.jpg",
		"!pazuzu": repository+"wayde_stay_night.jpg",
		"how goes the wayding": repository+"wayde_stay_night.jpg",
		"[[fflogsranks,parthel extelsiar,exodus]]": repository+"parthel_the_grey.png"
	},
	domtCache: {
		"star": "Increase one of your ability scores by 2. The score can exceed 20 but can't exceed 24.",
		"vizier": "At any time you choose within one year of drawing this card, you can ask a question in meditation and mentally receive a truthful answer to that question. Besides information, the answer helps you solve a puzzling problem or other dilemma. In other words, the knowledge comes with wisdom on how to apply it.",
		"sun": "You gain 50,000 XP, and a wondrous item (which the DM determines randomly) appears in your hands.",
		"moon": "You are granted the ability to cast the wish spell 1d3 times.",
		"comet": "If you single-handedly defeat the next hostile monster or group of monsters you encounter, you gain experience points enough to gain one level. Otherwise, this card has no effect.",
		"the fates": "Reality's fabric unravels and spins anew, allowing you to avoid or erase one event as if it never happened. You can use the card's magic as soon as you draw the card or at any other time before you die.",
		"throne": "You gain proficiency in the Persuasion skill, and you double your proficiency bonus on checks made with that skill. In addition, you gain the rightful ownership of a small keep somewhere in the world. However, the keep is currently in the hands of monsters, which you must clear out before you can claim the keep as yours.",
		"key": "A rare or rarer magic weapon with which you are proficient appears in your hands.",
		"knight": "You gain the service of a 4th-level fighter who appears in a space you choose within 30 feet of you. The fighter is of the same race as you and serves you loyally until death, believing the fates have drawn him or her to you. You control this character.",
		"gem": "Twenty-fice pieces of jewelry worth 2,000 gp each or fifty gems worth 1,000 gp each appear at your feet.",
		"talons": "Every magic item you wear or carry disintegrates. Artifacts in your possession aren't destroyed but do vanish.",
		"the void": "This black card spells disaster. Your soul is drawn from your body and contained in an object in a place of the DM's choice. One or more powerful beings guard the place. While your soul is trapped in this way, your body is incapacitated. A wish spell can't restore your soul, but the spell reveals the location of the object that holds it. You draw no more cards.",
		"flames": "A powerful devil becomes your enemy. The devil seeks your ruin and plagues your life, savoring your suffering before attempting to slay you. This enmity lasts until either you or the devil dies.",
		"skull": "You summon an avatar of death - a ghostly humanoid skeleton clad in a tattered black robe and carrying a spectral scythe. It appears in a space of the DM's choice within 10 feet of you and attacks you, warning all others that you must win the battle alone. The avatar fights until you die or it drops to 0 hit points, whereupon it disappears. If anyone tries to help you, the helper summons its own avatar of death. A creatures slain by an avatar of death can't be restores to life.",
		"idiot": "Permenantly reduce your Intelligence by 1d4 + 1 (to a minimum score of 1).",
		"donjon": "You disappear and become entombed in a state of suspended animation in an extradimensional sphere. Everything you were wearing and carrying stays behind in the space you occupied when you disappeared. You remain imprisoned until you are found and removed from the sphere. You can't be located by and divination magic, but a wish spell can reveal the location of your prison. You draw no more cards.",
		"ruin": "All forms of wealth that you carry or own, other than magic items, are lost to you. Portable property vanishes. Businesses, buildings, and land you own are lost in a way that alters reality the least. Any documentation that proves you should own something lost to this card also disappears.",
		"euryale": "The card's medusa-like visage curses you. You take a -2 penalty on saving throws while cursed in this way. Only a god or the magic of The Fates card can end this curse.",
		"rogue": "A nonplayer character becomes hostile toward you. The identity of your new enemy isn't known until the NPC or someone else reveals it. Nothing less than a wish spell or divine intervention can end the NPC's hostility toward you.",
		"balance": "Your mind suffers a wrenching alteration, causing your alignment to change. Lawful becomes chaotic, good becomes evil, and vice versa. If you are true neutral or unaligned, this card has no effect on you.",
		"fool": "You lose 10,000 XP, discard this card, and draw from the deck again, counting both draws as one of your declared draws. If losing that much XP would cause you to lose a level, you instead lose an amount that leaves you with just enough XP to keep your level.",
		"jester": "You gain 10,000 XP, or you can draw two additional cards beyond your declared draws.",
	},
	classCache: {
		0: "Barbarian",
		1: "Bard",
		2: "Cleric",
		3: "Druid",
		4: "Fighter",
		5: "Monk",
		6: "Paladin",
		7: "Ranger",
		8: "Rogue",
		9: "Sorcerer",
		10: "Warlock",
		11: "Wizard",
		length: 12
	},
	raceCache: {
		0: "Dwarf",
		1: "Elf",
		2: "Halfling",
		3: "Human",
		4: "Dragonborn",
		5: "Gnome",
		6: "Half-Elf",
		7: "Half-Orc",
		8: "Tiefling",
		length: 9
	},
	dndTarotCache: {
		0: "Vizier",
		1: "Sun",
		2: "Moon",
		3: "Star",
		4: "Comet",
		5: "The Fates",
		6: "Throne",
		7: "Key",
		8: "Knight",
		9: "Gem",
		10: "Talons",
		11: "The Void",
		12: "Flames",
		13: "Skull",
		14: "Idiot",
		15: "Donjon",
		16: "Ruin",
		17: "Euryale",
		18: "Rogue",
		19: "Balance",
		20: "Fool",
		21: "Jester",
		length: 22
	},
	statArr: {
		0: "Strength	",
		1: "Dexterity   ",
		2: "Constitution",
		3: "Intelligence",
		4: "Wisdom	  ",
		5: "Charisma	",
		length: 6
	}
}