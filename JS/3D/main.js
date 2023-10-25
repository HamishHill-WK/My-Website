import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 310);  

//const backgroundColor = new THREE.Color(0xffffff); // Replace with your desired color in hexadecimal format
//scene.background = backgroundColor;

//creates render screen for three js
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const textureLoader = new THREE.TextureLoader();

//enables camera controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.listenToKeyEvents(renderer.domElement);
//controls.target.set(0, 0, 0);
controls.target.set(0, 0, 0);

const light = new THREE.PointLight(0xffffff, 1000, 4000);
scene.add(light);

const AmbientLight = new THREE.AmbientLight(0xffffff, 0.1);
scene.add(AmbientLight);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
//raycaster.near = 0; 
//raycaster.far = 10000;
// Handle mouse or touch events
document.addEventListener('mousedown', onMouseDown, false);

function onMouseDown(event) {
	// Calculate mouse coordinates in NDC space
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

	// Update the raycaster with the mouse coordinates
	raycaster.setFromCamera(mouse, camera);
	//raycaster.set

	// Find intersected objects
	const intersects = raycaster.intersectObjects(scene.children, true);

	const dx = camera.position.x - SunObject.mesh.position.x;
	const dy = camera.position.y - SunObject.mesh.position.y;
	const dz = camera.position.z - SunObject.mesh.position.z;

	// Use the Pythagorean theorem to find the distance
	const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

	console.log(distance);

	if (intersects.length > 0) {
		// Handle the click on an intersected object
		const clickedObject = intersects[0].object;
		// Perform actions specific to the clicked object
		controls.target.set(clickedObject.position.x, clickedObject.position.y, clickedObject.position.z);
		console.log(clickedObject);
	}
}

function request(planetCode) { //this function is used to make a request to the nasa horizon api
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

class SphereObject {
	constructor(radius, widthSegments, heightSegments, color, pathToTexture) {
		const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);		
		let material = new THREE.MeshBasicMaterial({ color });
		
		if (pathToTexture !== undefined) {
			const texture = textureLoader.load(pathToTexture);
			if (pathToTexture === SunTexturePath) {
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
	}

	addToScene(scene) {scene.add(this.mesh);}

	setRotation(x, y, z) {this.mesh.rotation.set(x, y, z);}

	setPosition(x, y, z) {this.mesh.position.set(x, y, z);}

	setScale(x, y, z) {this.mesh.scale.set(x, y, z);}
}

const texturePath = '../../Images/SolarSystem/';
const SunTexturePath = `${texturePath}SunTexture.jpg`
const MercuryTexturePath = `${texturePath}MercuryTexture.jpg`
const VenusTexturePath = `${texturePath}VenusTexture.jpg`
const MarsTexturePath = `${texturePath}MarsTexture.jpg`
const JupiterTexturePath = `${texturePath}JupiterTexture.jpg`
const SaturnTexturePath = `${texturePath}SaturnTexture.jpg`
const UranusTexturePath = `${texturePath}UranusTexture.jpg`
const NeptuneTexturePath = `${texturePath}NeptuneTexture.jpg`

const SunObject = new SphereObject(0.465, 64, 32, 0xff0000, SunTexturePath);

const MercuryObject = new SphereObject(0.01, 64, 32, 0x0000ff, MercuryTexturePath);
const VenusObject = new SphereObject(0.04, 64, 32, 0x00ff00, VenusTexturePath);
//const Earth = new SphereObject(0.042, 32, 16, 0x00ff00);
const MarsObject = new SphereObject(0.022, 64, 32, 0xff0000, MarsTexturePath);
const JupiterObject = new SphereObject(0.47, 64, 32, 0x550000, JupiterTexturePath);
const SaturnObject = new SphereObject(0.47, 64, 32, 0xffff11, SaturnTexturePath);
const UranusObject = new SphereObject(0.47, 64, 32, 0xff00ff, UranusTexturePath);
const NeptuneObject = new SphereObject(0.47, 64, 32, 0x5500ff, NeptuneTexturePath);

const bodyScale = 10;

MercuryObject.setScale(bodyScale, bodyScale, bodyScale);
VenusObject.setScale(bodyScale, bodyScale, bodyScale);
MarsObject.setScale(bodyScale, bodyScale, bodyScale);
JupiterObject.setScale(bodyScale, bodyScale, bodyScale);
SaturnObject.setScale(bodyScale, bodyScale, bodyScale);
UranusObject.setScale(bodyScale, bodyScale, bodyScale);
NeptuneObject.setScale(bodyScale, bodyScale, bodyScale);
SunObject.setScale(bodyScale/2, bodyScale/2, bodyScale/2);

MercuryObject.addToScene(scene);
VenusObject.addToScene(scene);
MarsObject.addToScene(scene);
JupiterObject.addToScene(scene);
SaturnObject.addToScene(scene);
UranusObject.addToScene(scene);
NeptuneObject.addToScene(scene);
SunObject.addToScene(scene);

function animate() {
	requestAnimationFrame(animate);

	//SunObject.setRotation(0, 0, SunObject.mesh.rotation.z + 0.01);

	controls.update();
	renderer.render(scene, camera);
}

function init() {
	const mercury = request(1);
	//const earth = request(3);
	const mars = request(4);
	const venus = request(2);
	const jupiter = request(5);
	const saturn = request(6);
	const uranus = request(7);
	const neptune = request(8);

	Promise.all([mercury, venus, mars, jupiter, saturn, uranus, neptune])  //this is used to wait for both api requests to complete
		.then(data => {
			const mercuryData = getData(data[0]);
			const venusData = getData(data[1]);
			//const earthData = getData(data[2]);
			const marsData = getData(data[2]);
			const jupiterData = getData(data[3]);
			const saturnData = getData(data[4]);
			const uranusData = getData(data[5]);
			const neptuneData = getData(data[6]);

			const mercuryPos = cartesianCoords(mercuryData[4], mercuryData[5], mercuryData[6]);
			const venusPos = cartesianCoords(venusData[4], venusData[5], venusData[6]);
			//const earthPos = cartesianCoords(earthData[4], earthData[5], earthData[6]);
			const marsPos = cartesianCoords(marsData[4], marsData[5], marsData[6]);
			const jupiterPos = cartesianCoords(jupiterData[4], jupiterData[5], jupiterData[6]);
			const saturnPos = cartesianCoords(saturnData[4], saturnData[5], saturnData[6]);
			const uransPos = cartesianCoords(uranusData[4], uranusData[5], uranusData[6]);
			const neptunePos = cartesianCoords(neptuneData[4], neptuneData[5], neptuneData[6]);

			MercuryObject.setPosition(mercuryPos[0], mercuryPos[1], mercuryPos[2]);
			VenusObject.setPosition(venusPos[0], venusPos[1], venusPos[2]);
			//Earth.setPosition(earthPos[0], earthPos[1], earthPos[2]);
			MarsObject.setPosition(marsPos[0], marsPos[1], marsPos[2]);
			JupiterObject.setPosition(jupiterPos[0], jupiterPos[1], jupiterPos[2]);
			SaturnObject.setPosition(saturnPos[0], saturnPos[1], saturnPos[2]);
			UranusObject.setPosition(uransPos[0], uransPos[1], uransPos[2]);
			NeptuneObject.setPosition(neptunePos[0], neptunePos[1], neptunePos[2]);
		})
		.catch(error => {
			console.error('Error', error);
		});
}

function getData(data) {
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

function cartesianCoords(longitude, latitude, distance) {
	distance = parseFloat(distance);
	distance = distance * 10;

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

init();
animate();