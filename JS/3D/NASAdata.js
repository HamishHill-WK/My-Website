export async function request(planetCode, startDate, stopDate) { //this function is used to make a request to the nasa horizon api
	const format = 'json';
	const command = `${planetCode}99`;
	const quantities = '18,19';	//code 18 to request helio-centric longitude and latitude. 19 for The Sun's apparent range, (light-time aberrated) relative to the target center, as seen by the observer, in astronomical units (AU).
	let observerCode = '399'; //defualt observer earth

	if (planetCode === 3) {//if we are requesting the data for earth we must switch the observer
		observerCode = '299';
	}

	const url = `https://ssd.jpl.nasa.gov/api/horizons.api?format=${format}&COMMAND=${command}&OBJ_DATA='YES'&MAKE_EPHEM='YES'&EPHEM_TYPE='OBSERVER'&CENTER='500@${observerCode}'&START_TIME='${startDate}'&STOP_TIME='${stopDate}'&STEP_SIZE='1%20d'&QUANTITIES='${quantities}'`;
	currentAttempts = 0;
	try {
		const result = await makeRequest(url, currentAttempts, 7500);
		return result;
	} catch (error) {
		throw error;
	}
}

async function makeRequest(url, currentAttempt, delay) {
	try {
		const response = await fetch(`https://corsproxy.io/?${url}`);

		if (response.ok) {
			console.log("response ok"); 
			return await response.json();

		} else {
			if (currentAttempt < maxRequestAttempts) {
				console.log(`Attempt ${currentAttempt} failed. Retrying in ${delay / 1000} seconds...`);
				await new Promise(resolve => setTimeout(resolve, delay));
				return await makeRequest(url, currentAttempt + 1, delay);
			} else {
				throw new Error("Maximum number of attempts reached. Request failed."); // Reject the promise if max attempts reached
			}
		}
	} catch (error) {
		console.log(error);
		if (currentAttempt < maxRequestAttempts) {
			console.log(`Attempt ${currentAttempt} failed. Retrying in ${delay / 1000} seconds...`);
			await new Promise(resolve => setTimeout(resolve, delay)); // Add a delay here
			return await makeRequest(url, currentAttempt + 1, delay); // Recursively retry
		} else {
			throw new Error("Maximum number of attempts reached. Request failed.");
		}
	}
}

const maxRequestAttempts = 55;
let currentAttempts = 0;

export function getData(data) {	//function to extract necessary data from json file received in api request
	const lines = data.result.split('\n');
	//console.log(data);
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

	
	//console.log(extractedLines);

	//extracts all numeric values (including integers and floating-point numbers) from the first line of the extractedLines array 
	return extractedLines[0].match(/[-+]?[0-9]*\.?[0-9]+/g);
}

export function cartesianCoords(longitude, latitude, distance, bodyScale) {	//function to convert heliocentric longitude, latitude and distance from the sun to cartesian coordinates.
	distance = parseFloat(distance);
	distance = distance * bodyScale / 500;

	const hEclLonRad = longitude * (Math.PI / 180);
	const hEclLatRad = latitude * (Math.PI / 180);

	const x = distance * Math.cos(hEclLatRad) * Math.cos(hEclLonRad);
	const y = distance * Math.sin(hEclLatRad);
	const z = distance * Math.cos(hEclLatRad) * Math.sin(hEclLonRad);

	return [x, y, z];
}