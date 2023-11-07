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
	let isInsideBlock = false;
	const extractedLines = [];
	const cartesianPositions = [];

	for (const line of lines) {
		if (line.trim() === '$$SOE') {	//the relevant data can be found between between these character codes
			isInsideBlock = true;
		} else if (line.trim() === '$$EOE') {
			isInsideBlock = false;
		} else if (isInsideBlock) {
			extractedLines.push(line);
		}
	}
	
	for (const line of extractedLines) {		
		let extractedDate = String(line.substr(0, 11));
		const extractedYear = line.substr(1, 5);
		const extractedMonth = monthAbbreviationToNumber(String(extractedDate[6] + extractedDate[7] + extractedDate[8]));
		let extractedDay = parseInt(line.substr(9, 10)) * -1;
		extractedDay = String(extractedDay).padStart(2, '0');
		extractedDate = `${extractedYear}${extractedMonth}-${extractedDay}`;
		const numericValues = line.match(/[-+]?[0-9]*\.?[0-9]+/g);
		cartesianPositions.push([cartesianCoords(numericValues[4], numericValues[5], numericValues[6]), extractedDate]);
	}
	console.log(cartesianPositions);
	return cartesianPositions;
}

export function cartesianCoords(longitude, latitude, distance) {	//function to convert heliocentric longitude, latitude and distance from the sun to cartesian coordinates.
	distance = parseFloat(distance);
	distance = distance * 50;	//Because we have already scaled up our celestial bodies
											//it is neccessary to increase the distances as well.
											//However, the distances are increased by a lesser factor than scale of the objects
											//to prevent the scene from becoming too large and the planets being too far away to be seen.
											//If you wanted to make this simulation more scientifically accurate then the distance should be increased at the same rate as body scale.

	const hEclLonRad = longitude * (Math.PI / 180);
	const hEclLatRad = latitude * (Math.PI / 180);

	const x = distance * Math.cos(hEclLatRad) * Math.cos(hEclLonRad);
	const y = distance * Math.sin(hEclLatRad);
	const z = distance * Math.cos(hEclLatRad) * Math.sin(hEclLonRad);

	return [x, y, z];
}

function monthAbbreviationToNumber(abbreviation) {
	const monthMap = {
		Jan: '01',
		Feb: '02',
		Mar: '03',
		Apr: '04',
		May: '05',
		Jun: '06',
		Jul: '07',
		Aug: '08',
		Sep: '09',
		Oct: '10',
		Nov: '11',
		Dec: '12'
	};

	return monthMap[abbreviation];
}