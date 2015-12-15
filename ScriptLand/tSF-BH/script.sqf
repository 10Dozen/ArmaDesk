#define BRIEFING		_briefing = [];
#define TOPIC(NAME) 	_briefing pushBack ["Diary", [ NAME,
#define END			]];
#define ADD_TOPICS	for "_i" from (count _briefing) to 0 step -1 do {player createDiaryRecord (_briefing select _i);};

BRIEFING

TOPIC("MyTopic1")
"Text"
END

TOPIC("MyTopic2")
"Text"
END

TOPIC("MyTopic3")
"Text"
END

TOPIC("MyTopic4")
"Text"
END

a = _briefing;

ADD_TOPICS
