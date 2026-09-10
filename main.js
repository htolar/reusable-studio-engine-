import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const canvas = document.querySelector('#studio-canvas');
const revealSlider = document.querySelector('#reveal-slider');
const viewer = document.querySelector('.viewer');

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color('#dce7e1');

const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
camera.position.set(0, 1.7, 17);

const controls = new OrbitControls(camera, canvas);
controls.enablePan = false;
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 11;
controls.maxDistance = 24;
controls.target.set(0, 1.2, 0);

const ambientLight = new THREE.HemisphereLight('#fff8ef', '#6b8179', 2.1);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight('#fff8ef', 3.2);
keyLight.position.set(-5, 8, 8);
keyLight.castShadow = true;
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight('#94b9c2', 1.7);
rimLight.position.set(6, 2, -6);
scene.add(rimLight);

const handRoot = new THREE.Group();
handRoot.rotation.y = Math.PI * 0.04;
scene.add(handRoot);

const layers = [
	{ name: 'Skin', color: '#d58e79', group: new THREE.Group() },
	{ name: 'Muscle', color: '#a94739', group: new THREE.Group() },
	{ name: 'Ligaments', color: '#d5aa4d', group: new THREE.Group() },
	{ name: 'Bones', color: '#eee7d8', group: new THREE.Group() },
	{ name: 'Veins', color: '#4777a8', group: new THREE.Group() },
];

layers.forEach(({ group }) => handRoot.add(group));

function material(color, roughness = 0.55, metalness = 0) {
	return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

function addSphere(group, position, scale, surfaceMaterial) {
	const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), surfaceMaterial);
	mesh.position.set(...position);
	mesh.scale.set(...scale);
	mesh.castShadow = true;
	mesh.receiveShadow = true;
	group.add(mesh);
	return mesh;
}

function addCapsule(group, position, radius, length, surfaceMaterial, rotation = [0, 0, 0]) {
	const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(radius, length, 8, 16), surfaceMaterial);
	mesh.position.set(...position);
	mesh.rotation.set(...rotation);
	mesh.castShadow = true;
	mesh.receiveShadow = true;
	group.add(mesh);
	return mesh;
}

function addBone(group, start, end, radius, surfaceMaterial) {
	const startVector = new THREE.Vector3(...start);
	const endVector = new THREE.Vector3(...end);
	const direction = endVector.clone().sub(startVector);
	const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(radius, direction.length(), 6, 12), surfaceMaterial);
	mesh.position.copy(startVector.clone().add(endVector).multiplyScalar(0.5));
	mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
	mesh.castShadow = true;
	mesh.receiveShadow = true;
	group.add(mesh);
	return mesh;
}

function addTube(group, points, radius, surfaceMaterial) {
	const curve = new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point)));
	const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 20, radius, 8, false), surfaceMaterial);
	mesh.castShadow = true;
	group.add(mesh);
	return mesh;
}

function createSkin() {
	const skin = material('#d58e79', 0.72);
	addSphere(layers[0].group, [0, 0.9, 0], [1.35, 1.65, 0.7], skin);
	addCapsule(layers[0].group, [0, -1.35, 0], 0.78, 1.5, skin);

	const fingers = [-0.9, -0.3, 0.3, 0.9];
	fingers.forEach((x, index) => {
		addCapsule(layers[0].group, [x, 2.55 + (index === 1 || index === 2 ? 0.2 : 0), 0], 0.28, 2.1, skin);
	});
	addCapsule(layers[0].group, [-1.35, 1.15, 0], 0.3, 1.25, skin, [0, 0, -0.82]);
}

function createMuscles() {
	const muscle = material('#a94739', 0.64);
	addSphere(layers[1].group, [0, 0.85, 0], [1.15, 1.4, 0.52], muscle);
	addCapsule(layers[1].group, [0, -1.25, 0], 0.56, 1.55, muscle);
	[-0.9, -0.3, 0.3, 0.9].forEach((x, index) => {
		addCapsule(layers[1].group, [x, 2.45 + (index === 1 || index === 2 ? 0.2 : 0), 0], 0.13, 1.75, muscle);
	});
	addSphere(layers[1].group, [-0.95, 1.25, 0], [0.34, 0.72, 0.28], muscle);
}

function createLigaments() {
	const ligament = material('#d5aa4d', 0.48, 0.05);
	[-0.9, -0.3, 0.3, 0.9].forEach((x, index) => {
		addBone(layers[2].group, [0, 1.85, 0], [x, 2.05 + (index === 1 || index === 2 ? 0.15 : 0), 0], 0.055, ligament);
		addBone(layers[2].group, [x, 1.95, 0], [x, 3.38 + (index === 1 || index === 2 ? 0.2 : 0), 0], 0.04, ligament);
	});
	addBone(layers[2].group, [-0.95, 1.65, 0], [-1.55, 1.05, 0], 0.06, ligament);
}

function createBones() {
	const bone = material('#eee7d8', 0.42);
	addBone(layers[3].group, [0, -1.95, 0], [0, 0.45, 0], 0.38, bone);
	addSphere(layers[3].group, [0, 0.6, 0], [1.05, 0.55, 0.5], bone);
	const fingers = [-0.9, -0.3, 0.3, 0.9];
	fingers.forEach((x, index) => {
		const tip = 3.8 + (index === 1 || index === 2 ? 0.2 : 0);
		addBone(layers[3].group, [x * 0.7, 0.7, 0], [x, 1.8, 0], 0.13, bone);
		addBone(layers[3].group, [x, 1.85, 0], [x, 2.75, 0], 0.11, bone);
		addBone(layers[3].group, [x, 2.8, 0], [x, tip, 0], 0.09, bone);
		addSphere(layers[3].group, [x, 1.8, 0], [0.19, 0.16, 0.16], bone);
		addSphere(layers[3].group, [x, 2.78, 0], [0.16, 0.14, 0.14], bone);
	});
	addBone(layers[3].group, [-0.7, 0.8, 0], [-1.55, 1.35, 0], 0.14, bone);
	addBone(layers[3].group, [-1.55, 1.35, 0], [-1.8, 2.05, 0], 0.11, bone);
}

function createVeins() {
	const vein = material('#4777a8', 0.42, 0.05);
	addTube(layers[4].group, [[0, -1.95, 0], [0.2, -0.8, 0.1], [-0.15, 0.4, 0.12], [0, 1.8, 0.1], [0.3, 2.9, 0.1], [0.3, 3.8, 0.1]], 0.045, vein);
	addTube(layers[4].group, [[0, 0.3, 0.1], [-0.7, 0.9, 0.1], [-0.9, 1.9, 0.1], [-0.9, 3.7, 0.1]], 0.038, vein);
	addTube(layers[4].group, [[0, 0.8, 0.1], [0.65, 1.3, 0.1], [0.9, 2.4, 0.1], [0.9, 3.8, 0.1]], 0.038, vein);
	addTube(layers[4].group, [[-0.25, 0.65, 0.1], [-1.05, 1.2, 0.1], [-1.55, 1.85, 0.1]], 0.04, vein);
}

createSkin();
createMuscles();
createLigaments();
createBones();
createVeins();

const explosionOffsets = [-2.4, -1.2, 0, 1.2, 2.4];
let reveal = Number(revealSlider.value);

function updateExplosion(value) {
	reveal = value;
	layers.forEach(({ group }, index) => {
		const depth = index - 2;
		group.position.x = explosionOffsets[index] * reveal;
		group.position.z = depth * reveal * 0.8;
		group.position.y = depth * reveal * 0.08;
	});
	layers[0].group.children.forEach((child) => {
		if (child.material) {
			child.material.transparent = true;
			child.material.opacity = THREE.MathUtils.lerp(1, 0.46, reveal);
		}
	});
}

function resize() {
	const bounds = viewer.getBoundingClientRect();
	renderer.setSize(bounds.width, bounds.height, false);
	camera.aspect = bounds.width / bounds.height;
	camera.updateProjectionMatrix();
}

window.addEventListener('resize', resize);
resize();
updateExplosion(reveal);

revealSlider.addEventListener('input', (event) => {
	updateExplosion(Number(event.currentTarget.value));
});

function animate() {
	controls.update();
	renderer.render(scene, camera);
	window.requestAnimationFrame(animate);
}

animate();
