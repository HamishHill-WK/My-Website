import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as NASA from './NASAdata.js';

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const textureLoader = new THREE.TextureLoader();
const texturePath = '../../Images/SolarSystem/';

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100000);
camera.position.set(0, 0, 25); 
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

// Assuming you have an instance of OrbitControls called 'controls'


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
	constructor(newName, radius, widthSegments, heightSegments, color, pathToTexture, label) {
		this._name = newName;
		this._radius = radius;
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
			if (pathToTexture === `${texturePath}StarsTexture.jpg`) {
				texture.wrapS = THREE.RepeatWrapping;
				texture.wrapT = THREE.RepeatWrapping;
				texture.repeat.set(4, 4);
				material = new THREE.MeshBasicMaterial({
					map: texture,
					side: THREE.BackSide,
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

		if (label) {
			const labelTexture = textureLoader.load(`${texturePath}Labels/${this.name}Label.png`);
			const labelMaterial = new THREE.SpriteMaterial({ map: labelTexture });
			labelMaterial.opacity = 0.6;
			const labelSprite = new THREE.Sprite(labelMaterial);
			labelSprite.center.set(0.5, 0);
			this._labelSprite = labelSprite;
			labelSprite.position.set(this.position.x + radius / 2, this.position.y + radius + 1 / 2, this.position.z + radius/ 2); // Set the 3D position
			scene.add(labelSprite);
			labelSprite.scale.set(5 , 3 , 1);
		}
	}

	updateLabel() {
		const distance = camera.position.distanceTo(this.labelSprite.position);
		const referenceDistance = 30;
		// Calculate the scale factor
		const scaleFactor = distance / referenceDistance;
		if (this.labelSprite !== undefined) {
			this.labelSprite.scale.set(5 * scaleFactor, 3 * scaleFactor, 1 * scaleFactor);
			this.labelSprite.position.set(this.position.x + this.radius / 2, this.position.y + this.radius + 1 / 2, this.position.z + this.radius / 2); // Set the 3D position
		}
	}

	addToScene(scene) {scene.add(this.mesh);}

	setRotation(x, y, z) { this.mesh.rotation.set(x, y, z); }

	setPosition(x, y, z) {
		this.mesh.position.set(x, y, z);
		this.updateLabel();
	}

	get position() { return this.mesh.position; }

	get labelSprite() { return this._labelSprite; }

	get name() { return this._name; }
	get radius() { return this._radius; }

	setScale(x, y, z) { this.mesh.scale.set(x, y, z); }
}

const skybox = new SphereObject('skybox', 100000, 128, 64, 0x5500ff, `${texturePath}StarsTexture.jpg`)
skybox.addToScene(scene);

const bodyScale = 10000;
const PlanetObjectsArray = [
	new SphereObject('Mercury', 0.0000163 * bodyScale, 128, 64, 0x0000ff, `${texturePath}MercuryTexture.jpg`, true),
	new SphereObject('Venus', 0.0000405 * bodyScale, 128, 64, 0x00ff00, `${texturePath}VenusTexture.jpg`, true),
	new SphereObject('Earth', 0.0000426 * bodyScale, 128, 64, 0x00ff00, `${texturePath}EarthTexture.jpg`, true),
	new SphereObject('Mars', 0.0000227 * bodyScale, 128, 64, 0xff0000, `${texturePath}MarsTexture.jpg`, true),
	new SphereObject('Jupiter', 0.000467 * bodyScale, 128, 64, 0x550000, `${texturePath}JupiterTexture.jpg`, true),
	new SphereObject('Saturn', 0.000389 * bodyScale, 128, 64, 0xffff11, `${texturePath}SaturnTexture.jpg`, true),
	new SphereObject('Uranus', 0.000169 * bodyScale, 128, 64, 0xff00ff, `${texturePath}UranusTexture.jpg`, true),
	new SphereObject('Neptune', 0.000164 * bodyScale, 128, 64, 0x5500ff, `${texturePath}NeptuneTexture.jpg`, true),
	new SphereObject('Pluto', 0.0000163 * bodyScale, 128, 64, 0x5500ff, `${texturePath}PlutoTexture.jpg`, true)
];

//Sun object will be at 0,0,0 so no need to include it in the planets array. Planetary objects' coords are calculated relative to the sun. 
const SunObject = new SphereObject('Sun', 0.004649 * bodyScale / 10, 128, 64, 0xff0000, `${texturePath}SunTexture.jpg`, true);
controls.addEventListener('change', () => {
	// Adjust sprite position here based on camera zoom level
	// You can use camera.position, camera.zoom, or other properties as needed
	SunObject.updateLabel();
	for (const Planet of PlanetObjectsArray) {
		Planet.updateLabel();
	}
});

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
	const pos = focusBody.position;
	controls.target.set(pos.x, pos.y, pos.z);
	controls.update();
	//SunObject.updateLabel();
	renderer.render(scene, camera);
}

init();