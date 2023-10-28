import * as THREE from 'three';

export class SphereObject {
	constructor(newName, radius, widthSegments, heightSegments, color, pathToTexture) {
		const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
		let material = new THREE.MeshBasicMaterial({ color });

		if (pathToTexture !== undefined) {
			const texture = textureLoader.load(pathToTexture);
			if (pathToTexture === SunTexturePath) {
				material = new THREE.MeshStandardMaterial({
					emissiveMap: texture,
					emissive: new THREE.Color(1, 1, 1),
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

	addToScene(scene) { scene.add(this.mesh); }

	setRotation(x, y, z) { this.mesh.rotation.set(x, y, z); }

	setPosition(x, y, z) { this.mesh.position.set(x, y, z); }

	setScale(x, y, z) { this.mesh.scale.set(x, y, z); }
}
