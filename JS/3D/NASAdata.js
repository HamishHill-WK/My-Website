export function request(planetCode) { //this function is used to make a request to the nasa horizon api
	const format = 'json';
	const command = `${planetCode}99`;
	const quantities = '18,19';	//code 18 to request helio-centric longitude and latitude. 19 for The Sun's apparent range, (light-time aberrated) relative to the target center, as seen by the observer, in astronomical units (AU).
	const startDate = '2023-09-19';
	const stopDate = '2023-09-20';
	let observerCode = '399'; //defualt observer earth

	if (planetCode === 3) {//if we are requesting the data for earth we must switch the observer
		observerCode = '299';
	}

	const url = `https://ssd.jpl.nasa.gov/api/horizons.api?format=${format}&COMMAND=${command}&OBJ_DATA='YES'&MAKE_EPHEM='YES'&EPHEM_TYPE='OBSERVER'&CENTER='500@${observerCode}'&START_TIME='${startDate}'&STOP_TIME='${stopDate}'&STEP_SIZE='1%20d'&QUANTITIES='${quantities}'`;
	console.log(url);
	return fetch(`https://corsproxy.io/?${url}`)	//cors proxy is used to get around cross origin security policy for this api 
		.then(response => {
			if (!response.ok) {//sometimes get a bad response from api, usually fixed on reloading the page
				throw new Error('Network response was not ok');	//TODO: handle bad response better 
			}
			return response.json();
		})
		.catch(error => {
			console.error('Error:', error);
		});
}

export function getData(data) {	//function to extract necessary data from json file received in api request
	const lines = data.result.split('\n');

	let isInsideBlock = false;
	const extractedLines = [];

	for (const line of lines) {
		if (line.trim() === '$$SOE') {	//the relevant data can be found between between these character codes
			isInsideBlock = true;
		} else if (line.trim() === '$$EOE') {
			isInsideBlock = false;
		} else if (isInsideBlock) {
			extractedLines.push(line);
		}
	}

	return extractedLines[0].match(/[-+]?[0-9]*\.?[0-9]+/g);
}

export function cartesianCoords(longitude, latitude, distance, bodyScale) {	//function to convert heliocentric longitude, latitude and distance from the sun to cartesian coordinates.
	distance = parseFloat(distance);
	distance = distance * bodyScale / 500;

	const hEclLonRad = longitude * (Math.PI / 180);
	const hEclLatRad = latitude * (Math.PI / 180);

	const x = distance * Math.cos(hEclLatRad) * Math.cos(hEclLonRad);
	const y = distance * Math.cos(hEclLatRad) * Math.sin(hEclLonRad);
	const z = distance * Math.sin(hEclLatRad);

	const coordinates1 = [x, y, z];
	const distance1 = Math.sqrt(
		coordinates1[0] ** 2 + coordinates1[1] ** 2 + coordinates1[2] ** 2
	);

	console.log(`Distance of coordinates1: ${distance1}, x:${x}, y:${y}, z:${z}`);

	return [x, y, z];
}