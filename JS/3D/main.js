import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as NASA from './NASAdata.js';
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const textureLoader = new THREE.TextureLoader();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100000);
camera.position.set(0, 0, 25); 
scene.add(camera);

const controls = new OrbitControls(camera, renderer.domElement);
controls.listenToKeyEvents(renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 5;

const light = new THREE.PointLight(0xffffff, 500, 4000);
scene.add(light);
const AmbientLight = new THREE.AmbientLight(0xffffff, 0.1);
scene.add(AmbientLight);

// Get all elements with the "myButton" class
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

startDateInput.addEventListener("blur", function () {
	// Get the input value
	if (startDateInput.value > endDate) {
		startDateInput.value = startDate;
		alert("Start date cannot be later than end date");
		return;
	}
	else {
		startDate = startDateInput.value;
		console.log("You typed: " + startDate);
	}

	//TODO: add limits to date requests, earliest date for data on all planets is july 1st 1750
	//Latest date is 08-Jan-2200

	//TODO: add functionality to change end date to equal start date + 1 if start date is set later.

	setPlanetPositions();

	// Display the input value in real-time
});

endDateInput.addEventListener("blur", function () {
	// Get the input value

	if (endDateInput.value < startDate) {
		endDateInput.value = endDate;
		alert("End date cannot be earlier than start date");
		return;
	}
	else {
		endDate = endDateInput.value;
		console.log("You typed: " + endDate);

	}
	setPlanetPositions();

	// Display the input value in real-time
});

// Add an event listener for each button
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
	}

	for (const Planet of PlanetObjectsArray) {
		if (Planet.name === name) {
			focusBody = Planet;
		}
	}
}

class SphereObject {
	constructor(newName, radius, widthSegments, heightSegments, color, pathToTexture) {
		const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);		
		let material = new THREE.MeshBasicMaterial({ color });
		
		if (pathToTexture !== undefined) {
			const texture = textureLoader.load(pathToTexture);
			if (pathToTexture === `${texturePath}SunTexture.jpg`) {
				material = new THREE.MeshStandardMaterial({
					emissiveMap: texture,
					emissive: new THREE.Color(1,1,1), 
				});
			}
			else {
				material = new THREE.MeshStandardMaterial({
					emissiveMap: texture,
					emissive: new THREE.Color(0.3, 0.3, 0.3),
				});
			}
		}

		this.mesh = new THREE.Mesh(geometry, material);
		this.name = newName;
	}

	addToScene(scene) {scene.add(this.mesh);}

	setRotation(x, y, z) { this.mesh.rotation.set(x, y, z); }

	setPosition(x, y, z) { this.mesh.position.set(x, y, z); }

	getPosition() { return this.mesh.position; }

	setScale(x, y, z) { this.mesh.scale.set(x, y, z); }
}

const texturePath = '../../Images/SolarSystem/';

const bodyScale = 10000;
const PlanetObjectsArray = [
	new SphereObject('Mercury', 0.0000163 * bodyScale, 128, 64, 0x0000ff, `${texturePath}MercuryTexture.jpg`),
	new SphereObject('Venus', 0.0000405 * bodyScale, 128, 64, 0x00ff00, `${texturePath}VenusTexture.jpg`),
	new SphereObject('Earth', 0.0000426 * bodyScale, 128, 64, 0x00ff00, `${texturePath}EarthTexture.jpg`),
	new SphereObject('Mars', 0.0000227 * bodyScale, 128, 64, 0xff0000, `${texturePath}MarsTexture.jpg`),
	new SphereObject('Jupiter', 0.000467 * bodyScale, 128, 64, 0x550000, `${texturePath}JupiterTexture.jpg`),
	new SphereObject('Saturn', 0.000389 * bodyScale, 128, 64, 0xffff11, `${texturePath}SaturnTexture.jpg`),
	new SphereObject('Uranus', 0.000169 * bodyScale, 128, 64, 0xff00ff, `${texturePath}UranusTexture.jpg`),
	new SphereObject('Neptune', 0.000164 * bodyScale, 128, 64, 0x5500ff, `${texturePath}NeptuneTexture.jpg`),
	new SphereObject('Pluto', 0.0000163 * bodyScale, 128, 64, 0x5500ff, `${texturePath}PlutoTexture.jpg`)
];

//Sun object will be at 0,0,0 so no need to include it in the planets array. Planetary objects' coords are calculated relative to the sun. 
const SunObject = new SphereObject('Sun', 0.004649 * bodyScale / 10, 128, 64, 0xff0000, `${texturePath}SunTexture.jpg`);
let focusBody = SunObject;
function spawnPlanetObjects() {
	SunObject.addToScene(scene);

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

function init() {
	spawnPlanetObjects();
	setPlanetPositions();
	animate();
}

function animate() {
	requestAnimationFrame(animate);
	const pos = focusBody.getPosition()
	controls.target.set(pos.x, pos.y, pos.z);
	controls.update();
	renderer.render(scene, camera);
}

init();