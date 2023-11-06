import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as NASA from './NASAdata.js';
import * as Object3D from './Object.js';
import * as DateManager from './dateManager.js';

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
//controls.minDistance = 5;	//prevents zooming inside target object
controls.maxDistance = 1000;
controls.minPolarAngle = Math.PI / 3;	//min vertical angle set to 60 degrees
controls.maxPolarAngle = 2 * Math.PI / 3;	//max vertical angle set to 120 degrees
controls.addEventListener('change', () => {	//when the camera moves the scale of labels is updated to maintain the scale relative to distance.
	SunObject.updateLabel();
	for (const Planet of PlanetObjectsArray) {
		Planet.updateLabel();
	}
});

startDateInput.addEventListener("blur", function () {
	setPlanetPositions(DateManager.startDateInput.value, DateManager.endDateInput.value);
});

endDateInput.addEventListener("blur", function () {
	setPlanetPositions(DateManager.startDateInput.value, DateManager.endDateInput.value);
});

const buttons = document.querySelectorAll(".focusButton");

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

new Object3D.SphereObject('Stars', 100000, 128, 64, 0x5500ff, false, scene, camera, textureLoader);	//skybox object 

const bodyScale = 10000;	//Due to the extreme difference in size all bodies in the solar system have been increased in order to make them visible in this simulation.
							//While this does make the simulation less accurate, it is necessary sacrifice for the purpose of this project. 
															//The sun object scale is increased by a reduced factor due to the extreme difference of size in the bodies  
const SunObject = new Object3D.SphereObject('Sun', 0.004649 * bodyScale /10, 128, 64, 0xff0000, true, scene, camera, textureLoader);
let focusBody = SunObject; //variable to track which object is the target of the camera
//Sun object will be at 0,0,0 so no need to include it in the planets array. Planetary objects' coords are calculated relative to the sun. 

const PlanetObjectsArray = [			//the sizes used are the radii of each body converted into Astronomical Units from Km. This is to maintain consistency with the data received from NASA, which is given in AU.
	new Object3D.SphereObject('Mercury', 0.0000163 * bodyScale, 128, 64, 0x0000ff, true, scene, camera, textureLoader),
	new Object3D.SphereObject('Venus', 0.0000405 * bodyScale, 128, 64, 0x00ff00, true, scene, camera, textureLoader),
	new Object3D.SphereObject('Earth', 0.0000426 * bodyScale, 128, 64, 0x00ff00, true, scene, camera, textureLoader),
	new Object3D.SphereObject('Mars', 0.0000227 * bodyScale, 128, 64, 0xff0000, true, scene, camera, textureLoader),
	new Object3D.SphereObject('Jupiter', 0.000467 * bodyScale, 128, 64, 0x550000, true, scene, camera, textureLoader),
	new Object3D.SphereObject('Saturn', 0.000389 * bodyScale, 128, 64, 0xffff11, true, scene, camera, textureLoader),
	new Object3D.SphereObject('Uranus', 0.000169 * bodyScale, 128, 64, 0xff00ff, true, scene, camera, textureLoader),
	new Object3D.SphereObject('Neptune', 0.000164 * bodyScale, 128, 64, 0x5500ff, true, scene, camera, textureLoader),
	new Object3D.SphereObject('Pluto', 0.0000163 * bodyScale, 128, 64, 0x5500ff, true, scene, camera, textureLoader)
];

function setFocus(name) {
	if (name === 'Sun') {
		focusBody = SunObject;
		console.log("sun selected");
	}

	for (const Planet of PlanetObjectsArray) {
		if (Planet.name === name) {
			focusBody = Planet;
		}
	}
}

export function setPlanetPositions(startDate, endDate) {
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
	setPlanetPositions(DateManager.startDateInput.value, DateManager.endDateInput.value);
	animate();
}

init();