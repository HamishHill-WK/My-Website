import * as THREE from 'three';
const texturePath = '../../Images/SolarSystem/';
export class SphereObject {
	constructor(newName, radius, widthSegments, heightSegments, color, label, scene, camera, textureLoader) {
		this._name = newName;
		this._radius = radius;
		this._camera = camera;
		const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
		let material = new THREE.MeshBasicMaterial({ color });
		let pathToTexture = `${texturePath}${this.name}Texture.jpg`;
		if (pathToTexture !== undefined) {
			const texture = textureLoader.load(pathToTexture);
			if (this.name === 'Stars') {
				texture.wrapS = THREE.RepeatWrapping;
				texture.wrapT = THREE.RepeatWrapping;
				texture.repeat.set(4, 4);
				material = new THREE.MeshBasicMaterial({
					map: texture,
					side: THREE.BackSide
				});
			}
			else {
				material = new THREE.MeshBasicMaterial({
					map: texture,
				});
			}
		}

		this.mesh = new THREE.Mesh(geometry, material);

		if (this.name === 'Saturn') {	//if this object is saturn then instance it's ring
			const geometry = new THREE.TorusGeometry(8, 3, 16, 100); 

			pathToTexture = `${texturePath}${this.name}RingTexture.png`;
			const ringTexture = textureLoader.load(pathToTexture);

			ringTexture.rotation = Math.PI / 2;
			ringTexture.wrapS = THREE.RepeatWrapping;
			ringTexture.wrapT = THREE.RepeatWrapping;
			ringTexture.repeat.set(4, 4);
			const material = new THREE.MeshBasicMaterial({
				map: ringTexture,
				side: THREE.DoubleSide
			});
			material.transparent = true;
			const ringMesh = new THREE.Mesh(geometry, material);
			ringMesh.rotateX(Math.PI / 2);
			ringMesh.scale.set(1, 1, 0.05);
			this.mesh.add(ringMesh);
		}

		scene.add(this.mesh);

		if (label) {
			const labelTexture = textureLoader.load(`${texturePath}Labels/${this.name}Label.png`);
			const labelMaterial = new THREE.SpriteMaterial({ map: labelTexture });
			labelMaterial.opacity = 0.6;
			const labelSprite = new THREE.Sprite(labelMaterial);
			scene.add(labelSprite);
			this._labelSprite = labelSprite;
			this.labelSprite.center.set(0.5, 0);
			this.labelSprite.position.set(this.position.x + radius / 2, this.position.y + radius + 1 / 2, this.position.z + radius / 2); // Set the 3D position
			this.labelSprite.scale.set(5, 3, 1);
		}
	}

	updateLabel() {
		if (this.labelSprite !== undefined) {
			this.labelSprite.position.set(this.position.x + this.radius / 2, this.position.y + this.radius + 1 / 2, this.position.z + this.radius / 2); // Set the 3D position
			const distance = this.camera.position.distanceTo(this.labelSprite.position);
			const referenceDistance = 30;
			const scaleFactor = distance / referenceDistance;
			this.labelSprite.scale.set(5 * scaleFactor, 3 * scaleFactor, 1 * scaleFactor);
		}
	}

	addToScene(scene) {
		scene.add(this.mesh);
		scene.add(this.labelSprite);
	}

	setRotation(x, y, z) { this.mesh.rotation.set(x, y, z); }

	setPosition(x, y, z) {
		this.mesh.position.set(x, y, z);
		this.updateLabel();
	}

	get position() { return this.mesh.position; }

	get labelSprite() { return this._labelSprite; }

	get name() { return this._name; }
	get radius() { return this._radius; }

	get camera() { return this._camera; }

	setScale(x, y, z) { this.mesh.scale.set(x, y, z); }
}

export class Planet extends SphereObject {
	constructor(newName, radius, widthSegments, heightSegments, color, label, scene, camera, textureLoader) {
		super(newName, radius, widthSegments, heightSegments, color, label, scene, camera, textureLoader);
		this._orbitPath = [];
		this._pathIndex = 0;
	}

	update() {
		if (this.orbitPath[this.pathIndex] !== undefined) {
			this.pathIndex += 1;
			if (this.pathIndex >= this.orbitPath.length) {
				this.pathIndex = 0;
			}
			this.setPosition(this.orbitPath[this.pathIndex][0][0], this.orbitPath[this.pathIndex][0][1], this.orbitPath[this.pathIndex][0][2]);
		}
	}

	getCurrentDate() {
		if (this.orbitPath[this.pathIndex] !== undefined) {
			return String(this.orbitPath[this.pathIndex][1]);
		}
	}

	renderOrbit(scene) {
		const positions = [];
		for (let i = 0; i < this.orbitPath.length; i++) {
			positions.push(new THREE.Vector3(this.orbitPath[i][0][0], this.orbitPath[i][0][1], this.orbitPath[i][0][2]));
		}

		const orbitGeometry = new THREE.BufferGeometry().setFromPoints(positions); // 100 segments
		const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });

		const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
		scene.add(orbitLine);		
	}

	get orbitPath() { return this._orbitPath; }
	set orbitPath(newOrbitPath) { this._orbitPath = newOrbitPath; }

	get pathIndex() { return this._pathIndex; }

	set pathIndex(newIndex) {
		if (String(newIndex).match(/^\d{4}-\d{2}-\d{2}$/)) {
			for (let i = 0; i < this.orbitPath.length; i++) {
				if (this.orbitPath[i][1] === newIndex) {
					if (i > 0) {
						this._pathIndex = i - 1;
					}
					else {
						this._pathIndex = this.orbitPath.length;
					}
				}
			}
		}
		else {
			this._pathIndex = newIndex;
		}
	}
}

