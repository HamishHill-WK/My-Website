import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as NASA from './NASAdata.js';

console.log("this is main.jsx")
import React from 'react';
import { createRoot } from 'react-dom/client';

// Clear the existing HTML content
document.body.innerHTML = '<div id="app"></div>';

// Render your React component instead
const root = createRoot(document.getElementById('app'));
root.render(<h1>Hello, world</h1>);


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

const light = new THREE.PointLight(0xffffff, 1000, 4000);
scene.add(light);
const AmbientLight = new THREE.AmbientLight(0xffffff, 0.1);
scene.add(AmbientLight);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
document.addEventListener('mousedown', onMouseDown, false);

function onMouseDown(event) {
	// Calculate mouse coordinates in NDC space
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

	raycaster.setFromCamera(mouse, camera);

	const intersects = raycaster.intersectObjects(scene.children, false);

	if (intersects.length > 0) {
		const clickedObject = intersects[0].object;
		controls.target.set(clickedObject.position.x, clickedObject.position.y, clickedObject.position.z);
		console.log(clickedObject.position.x, clickedObject.position.y, clickedObject.position.z);
	}

	for (let i = 0; i < intersects.length; i++) {
		console.log(`object ${i}: ${intersects[0].object}`);
	}
}

class SphereObject {
	constructor(newName, radius, widthSegments, heightSegments, color, pathToTexture) {
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
		this.name = newName;
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

const bodyScale = 10000;
const SunObject = new SphereObject('Sun', 0.004649 * bodyScale/10, 128, 64, 0xff0000, SunTexturePath);
const MercuryObject = new SphereObject('Mercury', 0.0000163 * bodyScale, 128, 64, 0x0000ff, MercuryTexturePath);
const VenusObject = new SphereObject('Venus', 0.0000405 * bodyScale, 128, 64, 0x00ff00, VenusTexturePath);
//const Earth = new SphereObject( 0.0000426 * bodyScale, 32, 16, 0x00ff00);
const MarsObject = new SphereObject('Mars', 0.0000227 * bodyScale, 128, 64, 0xff0000, MarsTexturePath);
const JupiterObject = new SphereObject('Jupiter', 0.000467 * bodyScale, 128, 64, 0x550000, JupiterTexturePath);
const SaturnObject = new SphereObject('Saturn', 0.000389 * bodyScale, 128, 64, 0xffff11, SaturnTexturePath);
const UranusObject = new SphereObject('Uranus', 0.000169 * bodyScale, 128, 64, 0xff00ff, UranusTexturePath);
const NeptuneObject = new SphereObject('Neptune', 0.000164 * bodyScale, 128, 64, 0x5500ff, NeptuneTexturePath);

//MercuryObject.setScale(bodyScale, bodyScale, bodyScale);
//VenusObject.setScale(bodyScale, bodyScale, bodyScale);
//MarsObject.setScale(bodyScale, bodyScale, bodyScale);
//JupiterObject.setScale(bodyScale, bodyScale, bodyScale);
//SaturnObject.setScale(bodyScale, bodyScale, bodyScale);
//UranusObject.setScale(bodyScale, bodyScale, bodyScale);
//NeptuneObject.setScale(bodyScale, bodyScale, bodyScale);
//SunObject.setScale(bodyScale/2, bodyScale/2, bodyScale/2);

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
	const mercury = NASA.request(1);
	//const earth = request(3);
	const mars = NASA.request(4);
	const venus = NASA.request(2);
	const jupiter = NASA.request(5);
	const saturn = NASA.request(6);
	const uranus = NASA.request(7);
	const neptune = NASA.request(8);

	Promise.all([mercury, venus, mars, jupiter, saturn, uranus, neptune])  //this is used to wait for both api requests to complete
		.then(data => {
			const mercuryData = NASA.getData(data[0]);
			const venusData = NASA.getData(data[1]);
			//const earthData = getData(data[2]);
			const marsData = NASA.getData(data[2]);
			const jupiterData = NASA.getData(data[3]);
			const saturnData = NASA.getData(data[4]);
			const uranusData = NASA.getData(data[5]);
			const neptuneData = NASA.getData(data[6]);

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

function cartesianCoords(longitude, latitude, distance) {	//function to convert heliocentric longitude, latitude and distance from the sun to cartesian coordinates.
	distance = parseFloat(distance);
	distance = distance * bodyScale/100;

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

