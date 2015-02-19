// Classnames for use

// Vehicles
#define CAR		"carClass"
#define TRUCK		"truckClass"
#define ARMED_CAR	"armedCarClass"
#define IFV		"ifvClass"
#define APC		"apcClass"
#define TANK		"tankClass"

#define HELI		"heliClass"
#define CAS_HELI	"casHeliClass"
#define CAS_PLANE	"casPlaneClass"

#define	TRUCK_REPAIR	"truckRepairClass"
#define	TRUCK_FUEL	"truckFuelClass"
#define	TRUCK_AMMO	"truckAmmoClass"

// DAC zones settings
// создает 5 групп пехоты размером 3, делает в зоне 50 пехотных вейпоинтов и дает каждой группе по 10.
#define DAC_Infantry	[5,3,50,10]
// то же самое с двумя следующими массивами (колесный трвнспорт и броня)
#define DAC_Car		[3,3,30,10]
#define DAC_Armored	[]
// создает в зоне 2 кемпа, размер групп, спавнящихся в кемре - 4, радиус патруля кемпа - 50 метров, 100% вероятность респавна, 5 респавнов на кем
#defice DAC_Camp	[2,4,50,0,100,4]

#define DAC_SEIZE_AREA(NAME,X,Y)	[NAME,[0,0,0,X,Y],DAC_Infantry,DAC_Car,DAC_Armored,DAC_Camp,[1,1,0,6]] spawn DAC_Init_Zone 
	
