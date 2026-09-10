import { startRenderLoop } from './src/Canvas/loop.js';
import { bindRevealInput } from './src/Canvas/input/input.js';
import { setupCanvas } from './src/Canvas/setupCanvas.js';

const canvas = document.querySelector('#studio-canvas');
const revealSlider = document.querySelector('#reveal-slider');
const { context, resize } = setupCanvas(canvas);

let viewport = resize();
let reveal = Number(revealSlider.value);

const anatomyLayers = [
	{ name: 'Skin', color: '#e8a38d' },
	{ name: 'Muscle', color: '#c45d40' },
	{ name: 'Ligaments', color: '#d2a84e' },
	{ name: 'Bones', color: '#f4f0e8' },
	{ name: 'Veins', color: '#4777a8' },
];

function drawHandSilhouette(context, fill, stroke, detail) {
	context.beginPath();
	context.moveTo(-38, 92);
	context.lineTo(-48, 40);
	context.lineTo(-62, 18);
	context.quadraticCurveTo(-76, -4, -63, -16);
	context.quadraticCurveTo(-54, -24, -44, -10);
	context.lineTo(-36, 2);
	context.lineTo(-36, -91);
	context.quadraticCurveTo(-36, -105, -24, -105);
	context.quadraticCurveTo(-12, -105, -12, -91);
	context.lineTo(-12, -118);
	context.quadraticCurveTo(-12, -132, 0, -132);
	context.quadraticCurveTo(12, -132, 12, -118);
	context.lineTo(12, -101);
	context.lineTo(12, -113);
	context.quadraticCurveTo(12, -126, 24, -126);
	context.quadraticCurveTo(36, -126, 36, -113);
	context.lineTo(36, -91);
	context.lineTo(36, -98);
	context.quadraticCurveTo(36, -111, 47, -111);
	context.quadraticCurveTo(58, -111, 58, -98);
	context.lineTo(58, -40);
	context.quadraticCurveTo(72, -51, 82, -40);
	context.quadraticCurveTo(91, -30, 80, -18);
	context.lineTo(56, 13);
	context.lineTo(52, 75);
	context.lineTo(38, 92);
	context.closePath();
	context.fillStyle = fill;
	context.fill();
	context.lineWidth = 2;
	context.strokeStyle = stroke;
	context.stroke();

	if (detail) {
		context.strokeStyle = detail;
		context.lineWidth = 2;
		context.beginPath();
		context.moveTo(-29, 14);
		context.quadraticCurveTo(0, 30, 34, 12);
		context.moveTo(-32, 42);
		context.quadraticCurveTo(0, 58, 34, 39);
		context.stroke();
	}
}

function drawMuscles(context) {
	context.fillStyle = '#c45d40';
	context.strokeStyle = '#8e3e2c';
	context.lineWidth = 2;
	context.beginPath();
	context.ellipse(0, 32, 32, 42, 0, 0, Math.PI * 2);
	context.ellipse(-47, 2, 11, 29, -0.5, 0, Math.PI * 2);
	context.ellipse(-24, -49, 8, 42, 0, 0, Math.PI * 2);
	context.ellipse(0, -57, 8, 52, 0, 0, Math.PI * 2);
	context.ellipse(24, -51, 8, 45, 0, 0, Math.PI * 2);
	context.ellipse(47, -37, 7, 34, 0, 0, Math.PI * 2);
	context.fill();
	context.stroke();
}

function drawLigaments(context) {
	context.strokeStyle = '#d2a84e';
	context.lineWidth = 4;
	context.lineCap = 'round';
	context.beginPath();
	context.moveTo(-47, 2);
	context.lineTo(-28, -20);
	context.lineTo(-24, -92);
	context.moveTo(-6, 23);
	context.lineTo(-1, -25);
	context.lineTo(0, -115);
	context.moveTo(14, 22);
	context.lineTo(24, -20);
	context.lineTo(24, -108);
	context.moveTo(34, 18);
	context.lineTo(47, -25);
	context.lineTo(47, -94);
	context.stroke();
	context.lineWidth = 3;
	context.beginPath();
	context.moveTo(-35, -20);
	context.lineTo(38, -20);
	context.moveTo(-38, 8);
	context.lineTo(34, 8);
	context.stroke();
}

function drawBones(context) {
	context.strokeStyle = '#f4f0e8';
	context.lineWidth = 7;
	context.lineCap = 'round';
	context.beginPath();
	context.moveTo(0, 83);
	context.lineTo(0, 24);
	context.moveTo(-27, 20);
	context.lineTo(-24, -88);
	context.moveTo(0, 20);
	context.lineTo(0, -116);
	context.moveTo(25, 20);
	context.lineTo(24, -103);
	context.moveTo(46, 12);
	context.lineTo(47, -86);
	context.moveTo(-36, 17);
	context.lineTo(-61, -5);
	context.stroke();
	context.fillStyle = '#f4f0e8';
	for (const joint of [[-24, -64], [0, -68], [24, -59], [47, -48]]) {
		context.beginPath();
		context.arc(joint[0], joint[1], 6, 0, Math.PI * 2);
		context.fill();
	}
}

function drawVeins(context) {
	context.strokeStyle = '#4777a8';
	context.lineWidth = 3;
	context.lineCap = 'round';
	context.beginPath();
	context.moveTo(8, 86);
	context.quadraticCurveTo(-12, 44, 2, 5);
	context.quadraticCurveTo(17, -20, 0, -63);
	context.moveTo(8, 38);
	context.quadraticCurveTo(-28, 15, -47, -5);
	context.moveTo(4, 12);
	context.quadraticCurveTo(28, -9, 47, -36);
	context.moveTo(0, -62);
	context.lineTo(-24, -98);
	context.moveTo(1, -61);
	context.lineTo(24, -105);
	context.stroke();
}

function drawLayer(context, layerIndex, reveal, offset) {
	const layerStart = layerIndex * 0.15;
	const opacity = Math.min(1, Math.max(0, (reveal - layerStart) / 0.22));

	if (opacity <= 0) {
		return;
	}

	const separation = offset * reveal * (layerIndex + 1);
	context.save();
	context.translate(separation, 0);
	context.globalAlpha = layerIndex === 0 ? Math.max(0.12, 1 - reveal * 0.9) : opacity;

	if (layerIndex === 0) {
		drawHandSilhouette(context, '#e8a38d', '#814f47', '#c5796d');
	} else {
		drawHandSilhouette(context, 'rgba(0, 0, 0, 0)', anatomyLayers[layerIndex].color, 'rgba(0, 0, 0, 0)');
		if (layerIndex === 1) drawMuscles(context);
		if (layerIndex === 2) drawLigaments(context);
		if (layerIndex === 3) drawBones(context);
		if (layerIndex === 4) drawVeins(context);
	}

	context.restore();
}

function drawLegend(context, x, y) {
	context.font = '12px Courier New, monospace';
	context.textBaseline = 'middle';
	anatomyLayers.forEach((layer, index) => {
		const itemY = y + index * 20;
		context.fillStyle = layer.color;
		context.fillRect(x, itemY - 5, 10, 10);
		context.fillStyle = '#36534a';
		context.fillText(layer.name, x + 18, itemY);
	});
}

function render() {
	const { width, height } = viewport;
	const centerX = width / 2;
	const centerY = height / 2 + 28;
	const handScale = Math.min(width / 260, height / 340, 1.45);
	const layerOffset = Math.min(width * 0.12, 72);

	context.clearRect(0, 0, width, height);
	context.save();
	context.translate(centerX, centerY);
	context.scale(handScale, handScale);
	for (let layerIndex = anatomyLayers.length - 1; layerIndex >= 0; layerIndex -= 1) {
		drawLayer(context, layerIndex, reveal, layerOffset / handScale);
	}
	context.restore();

	drawLegend(context, 24, 24);
}

window.addEventListener('resize', () => {
	viewport = resize();
});

bindRevealInput(revealSlider, (value) => {
	reveal = value;
});

startRenderLoop(render);
