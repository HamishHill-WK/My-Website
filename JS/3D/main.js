import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as NASA from './NASAdata.js';
const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const textureLoader = new THREE.TextureLoader();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100000);
camera.position.set(0, -25, 0); 
scene.add(camera);

const controls = new OrbitControls(camera, renderer.domElement);
controls.listenToKeyEvents(renderer.domElement);

const light = new THREE.PointLight(0xffffff, 600, 4000);
scene.add(light);
const AmbientLight = new THREE.AmbientLight(0xffffff, 0.1);
scene.add(AmbientLight);

// Get all elements with the "myButton" class
const buttons = document.querySelectorAll(".focusButton");

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
});

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

	setRotation(x, y, z) {this.mesh.rotation.set(x, y, z);}

	setPosition(x, y, z) { this.mesh.position.set(x, y, z); }

	getPosition() {
		return this.mesh.position;
	}

	setScale(x, y, z) {this.mesh.scale.set(x, y, z);}
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
	new SphereObject('Neptune', 0.000164 * bodyScale, 128, 64, 0x5500ff, `${texturePath}NeptuneTexture.jpg`)
];

//sun object will be at 0,0,0 so no need to include it in the planets array. Planetary objects' coords are calculated relative to the sun. 
const SunObject = new SphereObject('Sun', 0.004649 * bodyScale / 10, 128, 64, 0xff0000, `${texturePath}SunTexture.jpg`);
SunObject.addToScene(scene);

for (const Planet of PlanetObjectsArray) {
	Planet.addToScene(scene);
}

function animate() {
	requestAnimationFrame(animate);
	controls.update();
	renderer.render(scene, camera);
}

function init() {
	const PlanetData = [];

	for (let i = 1; i < PlanetObjectsArray.length + 1; i++) {
		PlanetData.push(NASA.request(i));
	}

	Promise.all(PlanetData)  //Promise is used to wait for all api requests to complete
		.then(rawData => {
			const PlanetsExtractData = [];
			const PlanetsPositions = [];
			for (const data of rawData) {
				PlanetsExtractData.push( NASA.getData(data));	//first relevant data is extracted from the received json file 
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

function setFocus(name) {
	console.log(name);
	if (name === 'Sun') {
		controls.target.set(0, 0, 0);
		console.log(controls.target);
	}

	for (const Planet of PlanetObjectsArray) {
		if (Planet.name === name) {
			console.log(name);
			console.log(Planet.getPosition());

			const pos = Planet.getPosition()
			
			controls.target.set(pos.x, pos.y, pos.z);
			console.log(controls.target);

		}
	}
}

function boop() {
	console.log("boop");
}

init();
animate();