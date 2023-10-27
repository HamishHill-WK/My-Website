export function request(planetCode) { //this function is used to make a request to the nasa horizon api
	const format = 'json';
	const command = `${planetCode}99`;
	//const command = `399`;	
	const quantities = '18,19';	//code 18 to request helio-centric longitude and latitude. 19 for The Sun's apparent range, (light-time aberrated) relative to the target center, as seen by the observer, in astronomical units (AU).
	const startDate = '2023-09-19';
	const stopDate = '2023-09-20';
	const url = `https://ssd.jpl.nasa.gov/api/horizons.api?format=${format}&COMMAND=${command}&OBJ_DATA='YES'&MAKE_EPHEM='YES'&EPHEM_TYPE='OBSERVER'&CENTER='500@399'&START_TIME='${startDate}'&STOP_TIME='${stopDate}'&STEP_SIZE='1%20d'&QUANTITIES='${quantities}'`;
	return fetch(`https://corsproxy.io/?${url}`)	//cors proxy is used to get around cross origin security policy for this api 
		.then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			return response.json();
		})
		.catch(error => {
			console.error('Error:', error);
		});
}

export function getData(data) {
	const lines = data.result.split('\n');

	let isInsideBlock = false;
	const extractedLines = [];

	for (const line of lines) {
		if (line.trim() === '$$SOE') {
			isInsideBlock = true;
		} else if (line.trim() === '$$EOE') {
			isInsideBlock = false;
		} else if (isInsideBlock) {
			extractedLines.push(line);
		}
	}

	return extractedLines[0].match(/[-+]?[0-9]*\.?[0-9]+/g);
}
