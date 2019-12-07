/*
  Dedicated location for constants, as defined in the book Strongholds & Followers
 */

var unitConstants = {};

unitConstants.ancestry = {
  // Ancestry: [Attack, Power, Defense, Toughness, Morale, [Traits]]
  Bugbear: [2, 0, 0, 0, 1, ["Martial"]],
  Dragonborn: [2, 2, 1, 1, 1, ["Courageous"]],
  Dwarf: [3, 1, 1, 1, 2, ["Stalwart"]],
  Elf: [2, 0, 0, 0, 1, ["Eternal"]],
  Elf_Winged: [1, 1, 0, 0, 1, ["Eternal"]],
  Ghoul: [-1, 0, 2, 2, 0, ["Undead", "Horrify", "Ravenous"]],
  Gnoll: [2, 0, 0, 0, 1, ["Frenzy"]],
  Gnome: [1, -1, 1, -1, 1, []],
  Goblin: [-1, -1, 1, -1, 0, []],
  Hobgoblin: [2, 0, 0, 0, 1, ["Bred_For_War", "Martial"]],
  Human: [2, 0, 0, 0, 1, ["Courageous"]],
  Kobold: [-1, -1, 1, -1, -1, []],
  Lizardfolk: [2, 1, -1, 1, 1, ["Amphibious"]],
  Ogre: [0, 2, 0, 2, 1, ["Brutal"]],
  Orc: [2, 1, 1, 1, 2, ["Savage"]],
  Skeleton: [-2, -1, 1, 1, 1, ["Undead", "Mindless"]],
  Treant: [0, 2, 0, 2, 0, ["Regenerate"]],
  Zombie: [-2, 0, 2, 2, 2, ["Undead", "Mindless"]]
};

unitConstants.traits = [
  // lol. yeah I'll do this some other time.
];

unitConstants.experience = {
  // Experience: [Attack, Power, Defense, Toughness, Morale]
  Green: [0, 0, 0, 0, 0],
  Regular: [1, 0, 0, 1, 1],
  Seasoned: [1, 0, 0, 1, 2],
  Veteran: [1, 0, 0, 1, 3],
  Elite: [2, 0, 0, 2, 4],
  Super_Elite: [2, 0, 0, 2, 5]
};

unitConstants.equipment = {
  // Equipment: [Attack, Power, Defense, Toughness, Morale]
  Light: [0, 1, 1, 0, 0],
  Medium: [0, 2, 2, 0, 0],
  Heavy: [0, 4, 4, 0, 0],
  Super_Heavy: [0, 6, 6, 0, 0]
};

unitConstants.unitType = {
  // Type: [Attack, Power, Defense, Toughness, Morale, CostModifier]
  Flying: [0, 0, 0, 0, 3, 2.00],
  Archers: [0, 1, 0, 0, 1, 1.75],
  Cavalry: [1, 1, 0, 0, 2, 1.50],
  Levies: [0, 0, 0, 0, -1, 0.75],
  Infantry: [0, 0, 1, 1, 0, 1.00],
  Siege_Engine: [1, 1, 0, 1, 0, 1.50]
};

unitConstants.size = {
  // This is the only set of constants that do not follow the book verbatim,
  // although I do honor the written Size-to-CostModifier values

  // key: Level, values: [Strength, MinTroops, MaxTroops, CostModifier, LevelName]
  1: [4, 0, 99, 0.66, "Squad"],
  2: [6, 100, 399, 1.00, "Company"],
  3: [8, 400, 999, 1.33, "Batallion"],
  4: [10, 1000, 1999, 1.66, "Division"],
  5: [12, 2000, 99999, 2.00, "Army"]
};