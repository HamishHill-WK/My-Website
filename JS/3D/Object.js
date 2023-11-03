import * as THREE from 'three';
const texturePath = '../../Images/SolarSystem/';
export class SphereObject {
	constructor(newName, radius, widthSegments, heightSegments, color, label, camera, textureLoader) {
		this._name = newName;
		this._radius = radius;
		this._camera = camera;
		const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
		let material = new THREE.MeshBasicMaterial({ color });
		const pathToTexture = `${texturePath}${this.name}Texture.jpg`;
		if (pathToTexture !== undefined) {
			const texture = textureLoader.load(pathToTexture);
			if (pathToTexture === `${texturePath}SunTexture.jpg`) {
				material = new THREE.MeshStandardMaterial({
					emissiveMap: texture,
					emissive: new THREE.Color(1, 1, 1),
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
			this._labelSprite = new THREE.Sprite(labelMaterial);
			this.labelSprite.center.set(0.5, 0);
			this.labelSprite.position.set(this.position.x + radius / 2, this.position.y + radius + 1 / 2, this.position.z + radius / 2); // Set the 3D position
			this.labelSprite.scale.set(5, 3, 1);
			//this.updateLabel();
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