# Sparkle

## What is Sparkle?

Sparkel is particle rendering boilerplate, written in JavaScript to draw particles on a canvas object. It provides general handling for particles and particle behavior you can extend and modify by overwriting certain functions.

It is a result of some experiments with canvas during the JavaScriptDays2012 in Munich (http://javascript-days.de/). 

### HowTo

Create a new emitter:
	
	var canvas = document.getElementById('myCanvas');
	var emitter = new SparklesEmitter(canvas);
	
Yay! That's it. You emitter is ready to draw particles on your canvas. How? Like this:
	
	emitter.fire();
	
You just have to fire the emitter on your draw cycles.

### Examples

Sparkle is just giving you tools to handle the rendering of your particles. Modify the new instance or modify SparkleEmitter itself to create the particle effect you need. The following examples will help you to understand how simple modifing a Sparkle instance is. 

#### Duration ([example_1.html](examples/example_1.html))

[Click here to run](https://rawgithub.com/netzleuchten/Sparkle/master/examples/example_1.html)

Let's start with an example for a particle burst with a lenght of 1 second. In the draw cycle we will check if we stell need to fire the emitter, else we delete it to save memory:

	
	var canvas = document.getElementById('myCanvas');
	var context = canvas.getContext('2d');
	var emitter = new SparkleEmitter(canvas); 
				
	emitter.setFireDuration(1);
	emitter.setParticlesPerSecond(50);

	function draw() {
					
		context.clearRect(0, 0, canvas.width, canvas.height);
		
		if(emitter.isAlive) {
			requestAnimationFrame(draw,canvas);
			emitter.fire();
		}else{
			alert('nothing more to do for our emitter. removing.');
			delete emitter;
		}

	}

	draw();
	
First we create the new instance:

	var emitter = new SparkleEmitter(canvas); 
	
Then we set how long the emitter should create particles in seconds:

	emitter.setParticlesPerSecond(50);
	
Inside our draw cycle we check if the emitter is still creating and rendering particles:

	if(emitter.isAlive) {
	
Only if rendering and creating particles has stopped, `isAlive` will turn `false`.
	

	
#### Render your own particles ([example_2.html](examples/example_2.html))

[Click here to run](https://rawgithub.com/netzleuchten/Sparkle/master/examples/example_2.html)

Lets extend the example above with our own particles:

	emitter.drawParticle = function(x, y, particle) {

		this.context.globalAlpha = particle.opacity;
		this.context.globalCompositeOperation = 'lighter';

		var halfSize = particle.size/2;

		this.context.beginPath();
		this.context.rect(
			x-halfSize,
			y-halfSize,
			particle.size,
			particle.size
		);

		this.context.fillStyle = '#99f';
		this.context.fill();

		return this;
	};
	
You can draw whatever you want in here. The function `drawParticle` always gets centered x and y values, based on the particle size. Also you can acces the particle attributes itself.

To get a more detailed control on saving and restoring the context, fading particles etc. you can overwrite `renderParticle(particle)` wich calls `drawParticle()`

### Particle behavior

On creating a particle (`addParticle()`) Sparkle calls a set of functions to set initial values. You can overwrite them all to modify these value on creation. Most of them use `this.randomBetween(start,end)` to return slightly different values for each particle.

* initialParticleLifetime()
* initialParticleSize()
* initialParticleAngle()
* initialParticleSpeed()

#### applyParticleVelocity()

Each particle has a property called `particle.velocity`. The function `applyParticleVelocity()` sets `particle.velocity.x` and `particle.velocity.y`. It  adds the right velocity based on `particle.speed` and `particle.angle`. Usually these are set by `initialParticleSpeed()` and `initialParticleAngle()` and are slightly different for each particle.

By overwriting this function you can modify how the velocity is calculated and manipulate the inital values.

#### modifyParticle()

`modifyParticle()` is called each time before `renderParticle()`. It moves the particle based on the velocity, applies gravity, checks if the particle is new or dieing and fades it in and out by changeing `particle.opacity`.

If you want to implement collision detection, special movements, more accurate gravity etc. here would be the right place.

### Some examples

* Modifying the angle, particle size and add gravity: [Source](examples/simple.html) / [Run](https://rawgithub.com/netzleuchten/Sparkle/master/examples/simple.html)
* Moving an emitter on the canvas: [Source](examples/walking.html) / [Run](https://rawgithub.com/netzleuchten/Sparkle/master/examples/walking.html)
* Handling multiple emitter, modifing them individually and killing them: [Source](examples/fireworks.html)  / [Run](https://rawgithub.com/netzleuchten/Sparkle/master/examples/fireworks.html)
