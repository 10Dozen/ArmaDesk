// Stuff to use

// Bases
#define FOBs		[fob_0, fob_1]
#define OUTPOSTs	[outpost_0, outpost_1, outpost_2]

// Vehicles (can be string or array)
#define RECON_CAR	["O_G_Offroad_01_F","I_MRAP_03_F"]
#define TRUCK_CARGO	["O_Truck_03_covered_F","O_Truck_02_covered_F","O_Truck_02_transport_F","O_Truck_03_transport_F"]
#define ARMED_CAR	"I_MRAP_03_hmg_F"
#define IFV		"O_APC_Wheeled_02_rcws_F"
#define APC		"O_APC_Tracked_02_cannon_F"
#define TANK		"O_MBT_02_cannon_F"

#define CARGO_HELI	"O_Heli_Light_02_unarmed_F"
#define CAS_HELI	"O_Heli_Attack_02_F"
#define CAS_PLANE	"O_Plane_CAS_02_F"

// Always string!
#define	TRUCK_REPAIR	"O_Truck_03_repair_F"
#define	TRUCK_FUEL	"O_Truck_02_fuel_F"
#define	TRUCK_AMMO	"O_Truck_02_Ammo_F"
#define BOX_AMMO	"Box_FIA_Ammo_F"
#define BOX_MEDIC	"O_CargoNet_01_ammo_F"

// Service Zones
#define SERVICE_AIR		{ hint "kekeke"; }
#define SERVICE_GROUND		"Land_ToiletBox_F"
#define SERVICE_OUTPOST		"Land_ToiletBox_F"








// Compositions
// #define BOX_AMMO_COMPOSITION(BOX1, BOX2)	BOX2 setPos (BOX1 modelToWorld [1.4, 0, -0.45]); BOX2 setDir (getDir BOX1 + 90)


// DAC zones settings
// создает 5 групп пехоты размером 3, делает в зоне 50 пехотных вейпоинтов и дает каждой группе по 10.
#define DAC_Infantry	[5,3,50,10]
// то же самое с двумя следующими массивами (колесный трвнспорт и броня)
#define DAC_Car			[3,3,30,10]
#define DAC_Armored		[]
// создает в зоне 2 кемпа, размер групп, спавнящихся в кемре - 4, радиус патруля кемпа - 50 метров, 100% вероятность респавна, 5 респавнов на кем
#define DAC_Camp		[2,4,50,0,100,4]
//последний массив - зона принадлежит 0 (опфор), корфиг юнитов зоны 0 (опфор), настройка скиллов 0, конфиг кемпов 0
#define DAC_Side		[1,1,0,6]

// #define DAC_SEIZE_AREA(NAME,X,Y)	[NAME, [0,0,0,X,Y], DAC_Infantry, DAC_Car, DAC_Armored, DAC_Camp, DAC_Side] spawn DAC_Init_Zone 
	
