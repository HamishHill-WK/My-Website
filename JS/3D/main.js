import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as NASA from './NASAdata.js';
import * as Object from './Object.js';

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const textureLoader = new THREE.TextureLoader();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100000);
camera.position.set(0, 0, 30); 
scene.add(camera);

const controls = new OrbitControls(camera, renderer.domElement);
controls.listenToKeyEvents(renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 5;	//prevents zooming inside target object
controls.maxDistance = 1000;
controls.minPolarAngle = Math.PI / 3;	//min vertical angle set to 60 degrees
controls.maxPolarAngle = 2 * Math.PI / 3;	//max vertical angle set to 120 degrees

const light = new THREE.PointLight(0xffffff, 500, 4000);
scene.add(light);
const AmbientLight = new THREE.AmbientLight(0xffffff, 0.1);
scene.add(AmbientLight);

const buttons = document.querySelectorAll(".focusButton");

const startDateInput = document.getElementById("startDateInput");
const endDateInput = document.getElementById("endDateInput");

const currentDate = new Date();
let year = currentDate.getFullYear();
let month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
let day = String(currentDate.getDate()).padStart(2, '0');
let startDate = `${year}-${month}-${day}`;
startDateInput.value = startDate;

currentDate.setDate(currentDate.getDate() + 1);
year = currentDate.getFullYear();
month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
day = String(currentDate.getDate()).padStart(2, '0');
let endDate = `${year}-${month}-${day}`;
endDateInput.value = endDate;

const maxDateString = '2099-12-30';
const maxDate = new Date(maxDateString);

const minDateString = '1749-12-31T23:59:59';
const minDate = new Date(minDateString);
console.log("After setting endDateInput.value:", minDate);

startDateInput.addEventListener("blur", function () {
	// Get the input value
	if (startDateInput.value >= endDate) {
		startDate = startDateInput.value;
		const newStartDate = new Date(startDate); 

		if (newStartDate > maxDate) {
			const newStartDate = new Date(maxDate); 

			newStartDate.setDate(newStartDate.getDate() - 1);

			year = newStartDate.getFullYear();
			month = String(newStartDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
			day = String(newStartDate.getDate()).padStart(2, '0');
			let newStartDateString = `${year}-${month}-${day}`;
			startDateInput.value = newStartDateString;
			startDate = startDateInput.value;
		}

		const newEndDate = new Date(startDate);
		newEndDate.setDate(newEndDate.getDate() + 1);
		year = newEndDate.getFullYear();
		month = String(newEndDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
		day = String(newEndDate.getDate()).padStart(2, '0');
		let newEndDateString = `${year}-${month}-${day}`;
		endDateInput.value = newEndDateString;
		endDate = endDateInput.value;


		setPlanetPositions();

	}
	else {
		startDate = startDateInput.value;
		let newStartDate = new Date(startDate);
		if (newStartDate < minDate) {
			newStartDate = new Date(minDate);
			year = newStartDate.getFullYear();
			month = String(newStartDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
			day = String(newStartDate.getDate()).padStart(2, '0');
			let newStartDateString = `${year}-${month}-${day}`;
			startDateInput.value = newStartDateString;
			startDate = startDateInput.value;
		}

		console.log("You typed: " + startDate);

		setPlanetPositions();
	}
});

endDateInput.addEventListener("blur", function () {
	// Get the input value

	if (endDateInput.value <= startDate) {
		endDate = endDateInput.value;
		let newStartDate = new Date(endDate);

		if (newStartDate < minDate) {
			newStartDate = new Date(minDate);
			console.log("After setting endDateInput.value:", newStartDate);
			console.log("After setting endDateInput.value:", minDate);
			year = newStartDate.getFullYear();
			month = String(newStartDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
			day = String(newStartDate.getDate()).padStart(2, '0');
			let newStartDateString = `${year}-${month}-${day}`;
			startDateInput.value = newStartDateString;
			startDate = startDateInput.value;

			newStartDate.setDate(newStartDate.getDate() + 1);
			year = newStartDate.getFullYear();
			month = String(newStartDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
			day = String(newStartDate.getDate()).padStart(2, '0');
			const newEndDateString = `${year}-${month}-${day}`;
			endDateInput.value = newEndDateString;
			endDate = endDateInput.value;
			console.log("After setting endDateInput.value:", endDateInput.value);
			console.log("After setting endDateInput.value:", startDateInput.value);

			setPlanetPositions();
		}
		else {
			newStartDate.setDate(newStartDate.getDate() - 1);

			year = newStartDate.getFullYear();
			month = String(newStartDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
			day = String(newStartDate.getDate()).padStart(2, '0');
			let newStartDateString = `${year}-${month}-${day}`;
			startDateInput.value = newStartDateString;
			startDate = startDateInput.value;
			console.log("After setting endDateInput.value:", endDateInput.value);
			setPlanetPositions();
		}
	}
	else {
		endDate = endDateInput.value;
		let newEndDate = new Date(endDate);
		if (newEndDate > maxDate) {
			newEndDate = new Date(maxDate);
			year = newEndDate.getFullYear();
			month = String(newEndDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
			day = String(newEndDate.getDate()).padStart(2, '0');
			let newEndDateString = `${year}-${month}-${day}`;
			endDateInput.value = newEndDateString;
			endDate = endDateInput.value;
		}

		setPlanetPositions();
	}
});

buttons.forEach((button) => {
	button.addEventListener("click", function () {
		buttons.forEach((otherButton) => {
			if (otherButton.classList.contains("clicked")) {
				otherButton.classList.remove("clicked");
			}
		});

		button.classList.add("clicked");
		setFocus(button.textContent);
	});

	if (button.textContent === "Sun") {
		button.classList.add("clicked");
	}
});

function setFocus(name) {
	if (name === 'Sun') {
		controls.target.set(0, 0, 0);
		console.log("sun selected");
	}

	for (const Planet of PlanetObjectsArray) {
		if (Planet.name === name) {
			focusBody = Planet;
		}
	}
}

const skybox = new Object.SphereObject('skybox', 100000, 128, 64, 0x5500ff, false, camera, textureLoader);

const bodyScale = 10000;
const PlanetObjectsArray = [
	new Object.SphereObject('Mercury', 0.0000163 * bodyScale, 128, 64, 0x0000ff, true, camera, textureLoader),
	new Object.SphereObject('Venus', 0.0000405 * bodyScale, 128, 64, 0x00ff00, true, camera, textureLoader),
	new Object.SphereObject('Earth', 0.0000426 * bodyScale, 128, 64, 0x00ff00, true, camera, textureLoader),
	new Object.SphereObject('Mars', 0.0000227 * bodyScale, 128, 64, 0xff0000, true, camera, textureLoader),
	new Object.SphereObject('Jupiter', 0.000467 * bodyScale, 128, 64, 0x550000, true, camera, textureLoader),
	new Object.SphereObject('Saturn', 0.000389 * bodyScale, 128, 64, 0xffff11, true, camera, textureLoader),
	new Object.SphereObject('Uranus', 0.000169 * bodyScale, 128, 64, 0xff00ff, true, camera, textureLoader),
	new Object.SphereObject('Neptune', 0.000164 * bodyScale, 128, 64, 0x5500ff, true, camera, textureLoader),
	new Object.SphereObject('Pluto', 0.0000163 * bodyScale, 128, 64, 0x5500ff, true, camera, textureLoader)
];

//Sun object will be at 0,0,0 so no need to include it in the planets array. Planetary objects' coords are calculated relative to the sun. 
const SunObject = new Object.SphereObject('Sun', 0.004649 * bodyScale / 10, 128, 64, 0xff0000, true, camera, textureLoader);

controls.addEventListener('change', () => {
	SunObject.updateLabel();
	for (const Planet of PlanetObjectsArray) {
		Planet.updateLabel();
	}
});

let focusBody = SunObject;
function spawnPlanetObjects() {
	SunObject.addToScene(scene);
	skybox.addToScene(scene);
	for (const Planet of PlanetObjectsArray) {
		Planet.addToScene(scene);
	}
}

function setPlanetPositions() {
	const PlanetData = [];

	for (let i = 1; i < PlanetObjectsArray.length + 1; i++) {
		PlanetData.push(NASA.request(i, startDate, endDate));
	}

	Promise.all(PlanetData)  //Promise is used to wait for all api requests to complete
		.then(rawData => {
			const PlanetsExtractData = [];
			const PlanetsPositions = [];
			for (const data of rawData) {
				PlanetsExtractData.push(NASA.getData(data));	//first relevant data is extracted from the received json file 
			}

			for (const extractedData of PlanetsExtractData) {	//the data is then converted in cartesian coords to place the object in the 3D scene
				PlanetsPositions.push(NASA.cartesianCoords(extractedData[4], extractedData[5], extractedData[6], bodyScale));
			}

			for (let i = 0; i < PlanetObjectsArray.length; i++) {	//Rendered planetary objects' positions are updated to correspond with the data received from NASA
				PlanetObjectsArray[i].setPosition(PlanetsPositions[i][0], PlanetsPositions[i][1], PlanetsPositions[i][2]);
			}

		})
		.catch(error => {
			console.error('Error', error);
		});
}
function animate() {
	requestAnimationFrame(animate);
	const pos = focusBody.position;
	controls.target.set(pos.x, pos.y, pos.z);
	controls.update();
	renderer.render(scene, camera);
}

function init() {
	spawnPlanetObjects();
	setPlanetPositions();
	animate();
}

init();