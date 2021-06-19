let GAS_DENSITY = 0.0005, 
	NUM_DIFFUSERS = 1,
	DIFFUSER_RADIUS = 40;
let	TEMP = 10;
const VALUES = []
let historic = document.querySelector('#historical')
historic.height = 700
historic.width = 1100
let canvasWidth = 1100
	canvasHeight = 700
	numGasParticles = Math.round(canvasWidth * canvasHeight * GAS_DENSITY),
	svgCanvas = d3.select('svg#canvas')
		.attr('width', canvasWidth)
		.attr('height', canvasHeight);

function randomVelocity(temp) {
	return d3.randomNormal(0, Math.floor(Math.random() * temp))();
}

let diffusers = d3.range(NUM_DIFFUSERS).map(() => {
	console.log('elo')
    return {
        x: Math.floor(Math.random() * canvasWidth),
        y: Math.floor(Math.random() * canvasHeight),
        vx: 0,
        vy: 0,
        r: DIFFUSER_RADIUS
    }
});

function generateParticles(temp) {

	let gas = d3.range(numGasParticles).map(() => {
		return {
			x: Math.random() * canvasWidth,
			y: Math.random() * canvasHeight,
			vx: randomVelocity(temp),
			vy: randomVelocity(temp),
			r: 3
		}
	});

	return diffusers.concat(gas);
}

let historicalContext = document.querySelector('#historical')
  .getContext('2d', {alpha: true})

historicalContext.lineWidth = 2
historicalContext.strokeStyle = 'rgba(255, 67, 55, 1)'

document.querySelector('#reset').onclick = function() {historicalContext.clearRect(0, 0, canvasWidth, canvasHeight)}

let forceSim = d3.forceSimulation()
	.alphaDecay(0)
	.velocityDecay(0)
	.on('tick', particleDigest)
	.force('bounce', d3.forceBounce()
		.radius(d => d.r)
	)
	.force('container', d3.forceSurface()
		.surfaces([
			{from: {x:0,y:0}, to: {x:0,y:canvasHeight}},
			{from: {x:0,y:canvasHeight}, to: {x:canvasWidth,y:canvasHeight}},
			{from: {x:canvasWidth,y:canvasHeight}, to: {x:canvasWidth,y:0}},
			{from: {x:canvasWidth,y:0}, to: {x:0,y:0}}
		])
		.oneWay(true)
		.radius(d => d.r)
	)
	.nodes(generateParticles(TEMP));

// Event handlers
function onTemperatureChange(temp) {
	d3.select('#temperature-val').text(temp);
	let updatedParticles = forceSim.nodes().map(node => {
		return node.r === DIFFUSER_RADIUS ? node : {
			x: node.x,
			y: node.y,
			vx: node.vx * Math.sqrt(temp) / Math.sqrt(TEMP),
			vy: node.vy * Math.sqrt(temp) / Math.sqrt(TEMP),
			r: 3
		};
	})
	forceSim.nodes(updatedParticles);
	TEMP = temp;
}

function particleDigest() {
	let particle = svgCanvas.selectAll('circle.particle').data(forceSim.nodes());

	particle.exit().remove();

	particle.merge(
		particle.enter().append('circle')
			.classed('particle', true)
			.attr('r', d=> d.r)
			.attr('fill', '#293B5F')
	)
		.attr('cx', d => d.x)
		.attr('cy', d => d.y);
    
    historicalContext.beginPath()
    for(let diffuser of diffusers) {
      historicalContext.moveTo(diffuser.x, diffuser.y)
      historicalContext.lineTo(diffuser.x + 1, diffuser.y + 1)
    }
    historicalContext.stroke()
  
}

let val = document.querySelector('.val')
let roznica = document.querySelector('.roznica')
let difference = []
const generateTrayectory = () =>{
	diffusers.map(el => {
		let html = `
			<div>
			<span>x = ${(el.x).toFixed(2)}</span>
			<span>y = ${(el.y).toFixed(2)}</span>
			</div>
		`
		VALUES.push(html)
		difference.push({
			x: el.x,
			y: el.y
		})
	})
	val.innerHTML = VALUES.join('')
}

setInterval(()=>{
	generateTrayectory()
	roznica.innerHTML = `<p>w ciągu 2 sekund cząsteczka poruszyla się o</p> <p>${(difference[difference.length - 1].x - difference[difference.length - 2].x).toFixed(2)}
	 na osi X</p> <p> ${(difference[difference.length - 1].y - difference[difference.length - 2].y).toFixed(2)} na osi Y`
	
}, 2000)