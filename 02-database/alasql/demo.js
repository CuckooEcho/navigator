var alasql = require('alasql');

var data = [
	{
		teamname:'Alpha',
		members: [
			{
				membername:'Andrey',
				categories: ['JavaScript','C++']
			},
			{
				membername:'Mathias',
				categories: ['JavaScript','PHP']
			},
		]
	},
	{
		teamname:'Beta',
		members: [
			{
				membername:'Ole',
				categories: ['JavaScript']
			}
		]
	},
];

var res = alasql('SEARCH / AS @team \
		members / AS @member \
		categories / AS @category  \
		RETURN(@team->teamname AS team, @member->membername AS member, @category AS category) \
		FROM ?',[data]);
console.log(res);