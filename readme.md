# Sparkle

## What is Sparkle?

Sparkel is particle rendering boilerplate, written in JavaScript to draw particles on a canvas object. It provides general handling for particles and particle behavior you can extend and modify by overwriting certain functions.

It is a result of some experiments with canvas during the JavaScriptDays2012 in Munich (http://javascript-days.de/). 

### HowTo

Create a new emitter:
	
	var canvas = document.getElementById('myCanvas');
	var emitter = new SparklesEmitter(canvas);
	
Yay! That's it. Your emitter is ready to draw particles on your canvas. How? Like this:
	
	emitter.fire();
	
You just have to fire the emitter on your draw cycles.

### Examples

Sparkle is just giving you tools to handle the rendering of your particles. Modify the new instance or modify SparkleEmitter itself to create the particle effect you need. The following examples will help you to understand how simple modifying a Sparkle instance is.

#### Duration ([example_1.html](examples/example_1.html))

[Click here to run](https://rawgithub.com/netzleuchten/Sparkle/master/examples/example_1.html)

Let's start with an example for a particle burst with a lenght of 1 second. In the draw cycle we will check if we still need to fire the emitter, else we delete it to save memory:

	
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

		this.context.beginPath();
		this.context.rect(
			x,
			y,
			particle.size,
			particle.size
		);

		this.context.fillStyle = '#99f';
		this.context.fill();

		return this;
	};
	
You can draw whatever you want in here. The function `drawParticle` always gets centered x and y values, based on the particle size. Also you can access the particle attributes itself.

To get a more detailed control on saving and restoring the context, fading particles etc. you can overwrite `renderParticle(particle)` wich calls `drawParticle()`

### Emitter behavior

The emitter is the main object wich pours out your particles. Different functions can be used to modify its behavior.

* setPosition(object) - needs and object like {x: 100,y: 200}
* setDirection(degree)
* setRadius(degree)
* setGravity(float)

Call these values before you fire the emitter to position and point the emitter.

### Particle behavior

#### Setting particle attributes

There are diffrent ways to set a particles size, speed and lifetime. The simplest way is to use the setParticle* functions.

* setParticleSize(default,max)
* setParticleSpeed(default,max)
* setParticleLifetime(default,max)

The parameter `max` is optional. When setting this parameter you switch from fixed values to random values between `default` and `max`. 

#### Overwriting the initialParticle* functions

On creating a particle (`addParticle()`) Sparkle calls a set of functions to set initial values. You can overwrite them all to modify these value on creation. They decide wether a particle attribute is fixed or is random between two values, defined with one of the setParticle* functions or the emitter behavior.

* initialParticleLifetime()
* initialParticleSize()
* initialParticleAngle()
* initialParticleSpeed()

You are able to overwrite them to add special behavior to your particles based on time or emitter/particle parameters.

#### applyParticleVelocity()

Each particle has a property called `particle.velocity`. The function `applyParticleVelocity()` sets `particle.velocity.x` and `particle.velocity.y`. It  adds the right velocity based on `particle.speed` and `particle.angle`. Usually these are set by `initialParticleSpeed()` and `initialParticleDirection()` and are slightly different for each particle.

By overwriting this function you can modify how the velocity is calculated and manipulate the inital values.

#### modifyParticle()

`modifyParticle()` is called each time before `renderParticle()`. It moves the particle based on the velocity, applies gravity, checks if the particle is new or dieing and fades it in and out by changeing `particle.opacity`.

If you want to implement collision detection, special movements (e.g. rotation), more accurate gravity etc. here would be the right place.

### Some examples

* Modifying the angle, particle size and add gravity: [Source](examples/simple.html) / [Run](https://rawgithub.com/netzleuchten/Sparkle/master/examples/simple.html)
* Moving an emitter on the canvas: [Source](examples/walking.html) / [Run](https://rawgithub.com/netzleuchten/Sparkle/master/examples/walking.html)
* Handling multiple emitter, modifing them individually and killing them: [Source](examples/fireworks.html)  / [Run](https://rawgithub.com/netzleuchten/Sparkle/master/examples/fireworks.html)
