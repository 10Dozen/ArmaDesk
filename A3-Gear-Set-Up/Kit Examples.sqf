// Simple Kit
kitName = [
	// Equipment
	[
		"UniformClassname",
		"VestClassname",
		"BackpackClassname",
		"HeadgearClassname",
		"GlassesClassname"
	],
	// Primary Weapon
	[
		"PrimaryWeaponClassname",
		"PrimaryWeaponOpticClassname",
		"PrimaryWeaponMuzzleClassname",
		"PrimaryWeaponPointerClassname"
	],
	// Secondary Weapon
	[
		"SecondaryWeaponClassname"
	],
	// Handgun Weapon
	[
		"HandgunWeaponClassname",
		"HandgunWeaponOpticClassname",
		"HandgunWeaponMuzzleClassname",
		"HandgunWeaponPointerClassname"
	],
	// Personal Items
	[
		"ItemNVG",
		"ItemRadio",
		"ItemGPS",
		"ItemMap",
		"ItemWatch",
		"ItemCompass"
	],
	// Magazines
	[
		["PrimaryWeaponMagazineClassname", 10],
		["SecondaryWeaponMagazineClassname", 10],
		["HandguyWeaponMagazineClassname", 10],
		["Magazine1Classname", 10],
		["Magazine2Classname", 10],
		["Magazine3Classname", 10],
		["Magazine4Classname", 10],
		["Magazine5Classname", 10],
		["Magazine6Classname", 10]
	],
	// Items
	[
		["Item1Classname", 10],
		["Item2Classname", 10],
		["Item3Classname", 10],
		["Item4Classname", 10],
		["Item5Classname", 10],
		["Item6Classname", 10]
	],
	// Person and Insignia
	[
		"Insignia",
		"Face",
		"Voice"
	]
];

// Kit with randomized gear
kitNameRandomized = [
	// Equipment
	[
		["Uniform_1", "Uniform_2"],
		["Vest_1", "Vest_2"],
		["Backpack_1", "Backpack_2"],
		["Headgear_1", "Headgear_2"],
		["Glasses_1", "Glasses_2"]
	],
	// Primary Weapon
	[
		["PrimaryWeapon_1", "PrimaryWeapon_2"],
		["PrimaryWeaponOptic_1", "PrimaryWeaponOptic_2"],
		["PrimaryWeaponMuzzle_1", "PrimaryWeaponMuzzle_2"],
		["PrimaryWeaponPointer_1", "no"]
	],
	// Secondary Weapon
	[
		["SecondaryWeapon_1", "SecondaryWeapon_2"]
	],
	// Handgun Weapon
	[
		["HandgunWeapon_1", "HandgunWeapon_2"],
		"HandgunWeaponOpticClassname",
		"HandgunWeaponMuzzleClassname",
		"HandgunWeaponPointerClassname"
	],
	// Personal Items
	[
		["ItemNVG_1", "ItemNVG_2"],
		["ItemRadio_1", "ItemRadio_2"],
		"ItemGPS",
		"ItemMap",
		"ItemWatch",
		"ItemCompass"
	],
	// Magazines
	[
		[["PrimaryWeaponMagazine_1", 10], ["PrimaryWeaponMagazine_2", 10]],
		["SecondaryWeaponMagazineClassname", 10],
		["HandguyWeaponMagazineClassname", 10],
		[["Magazine1Classname", 10], ["no",0]],
		["no", 10],
		["no", 10],
		["no", 10],
		["no", 10],
		["no", 10]
	],
	// Items
	[
		[["Item1_1", 10], ["Item1_2", 10]],
		["Item2Classname", 10],
		["Item3Classname", 10],
		["Item4Classname", 10],
		["Item5Classname", 10],
		["Item6Classname", 10]
	],
	// Person and Insignia
	[
		"Insignia",
		"Face",
		"Voice"
	]
];

// Array of Kit
kitNamePack = [
	kitName,
	kitNameRandomized
];
