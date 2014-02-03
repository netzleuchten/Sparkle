(function(window) {

/* ToDo:
 * - Smarter particle-limitation and global particle-limitation to make performance-optimization possible
 * - Box2D integration? Separate module, overwriting the SparkleEmitter prototype
 * - Check if JavaScript-Doc notation is right
 */

	/**
	 *
	 * @param {dom} canvas HTML Element
	 * @returns {_L1.SparkleEmitter}
	 */
	var SparkleEmitter = function(canvas) {
		
		// Internal data
		this.context = canvas.getContext('2d');
		this.particles = [];
		this.debug = false;
		
		// default values made local from SparkleEmitter.prototype.
		
		// Emitter configuration
		this.position = {x: canvas.width/2, y: canvas.height/2};
		this.gravity = 0;
		this.fireDuration = 0;
		this.radius = 45;
		this.direction = -90;
		this.maxParticles = 999999;
		this.size = {width: 1, height: 1};
		this.particlesPerSecond = 60;
		
		// Particle configuration		
		this.particle = {
			default: {
				speed: 150,
				size: 10,
				lifetime: 2,
				spin: 0,
				gravity: 0
			},
			max: {
				speed: 0,
				size: 0,
				lifetime: 0,
				spin: 0,
				gravity: 0
			}
		};

		// Parameter for rendering
		this.lifetime = 0;
		this.numNewParticles = 0;
		this.startSecond = this.getTime();
		this.currentSecond = this.getTime();
		this.pastSecond = this.getTime();
		this.deltaSecond = 1;
		this.createParticles = true;
		
		this.isAlive = true;
	};

	// Constants
	SparkleEmitter.prototype.PARTICLE_BORN = 1;
	SparkleEmitter.prototype.PARTICLE_LIVING = 2;
	SparkleEmitter.prototype.PARTICLE_DIEING = 3;
	SparkleEmitter.prototype.PARTICLE_DEAD = 0;
	SparkleEmitter.prototype.PI_180 = Math.PI/180;
	
	/**
	 * Return a precise timestamp, else fall back on Date object
	 * @returns {Object.timing.navigationStart|performance.timing.navigationStart|Number}
	 */
	SparkleEmitter.prototype.getTime = function() {
		
		if(window.performance && window.performance.now) {
			return performance.now() + performance.timing.navigationStart;
		}else{
			return Date.now();
		}

	};
	
	/**
	 * Size of the emitter
	 * @param {Number} width
	 * @param {Number} height
	 * @returns {_L1.SparkleEmitter.prototype}
	 */
	SparkleEmitter.prototype.setSize = function(width,height) {
		
		this.size = {
			width: width,
			height: height
		};
		
		return this;
	};
	
	/**
	 * Set how many particles per second should be emitted
	 * @param {Number} count Number of particles
	 * @returns {_L1.SparkleEmitter.prototype}
	 */
	SparkleEmitter.prototype.setParticlesPerSecond = function(count) {
		this.particlesPerSecond = count;
		return this;
	};
	
	/**
	 * Set global gravity in pixels per second
	 * @param {Number} pixelPerSecond
	 * @returns {_L1.SparkleEmitter.prototype}
	 */
	SparkleEmitter.prototype.setGravity = function(pixelPerSecond) {
		this.gravity = pixelPerSecond;
		return this;
	};
	
	/**
	 * Set a limit for particles to emit. 
	 * @todo maybe this should be global to optimize performance?
	 * @param {Number} max - A number
	 * @returns {_L1.SparkleEmitter.prototype}
	 */
	SparkleEmitter.prototype.setMaxParticles = function(max) {
		this.maxParticles = max;
		return this;
	};
	
	/**
	 * How fast a particle should move
	 * @param {Number} pixelsPerSecond
	 * @param {Float} max set max to randomize between the fixed value and the max value
	 * @returns {_L1.SparkleEmitter.prototype}
	 */
	SparkleEmitter.prototype.setParticleSpeed = function(pixelsPerSecond,max) {
		
		if(max) 
			this.particle.max.speed = max;
	
		this.particle.default.speed = pixelsPerSecond;
		
		return this;
	};
	
	/**
	 * Set a spin for the particles
	 * @param {Float} degreePerSecond how much degree per second a particle will spin
	 * @param {Float} max set max to randomize between the fixed value and the max value
	 * @returns {_L1.SparkleEmitter.prototype}
	 */
	SparkleEmitter.prototype.setParticleSpin = function(degreePerSecond,max) {
		
		if(max) 
			this.particle.max.spin = max;
	
		this.particle.default.spin = degreePerSecond;
		
		return this;
	};
	
	/**
	 * Set the size of the emitted particles
	 * @param {type} pixel height and width of particle
	 * @param {Float} max set max to randomize between the fixed value and the max value
	 * @returns {_L1.SparkleEmitter.prototype}
	 */
	SparkleEmitter.prototype.setParticleSize = function(pixel,max) {
		
		if(max) 
			this.particle.max.size = max;
	
		this.particle.default.size = pixel;
		return this;
	};
	
	/**
	 * How long a particle should livein seconds
	 * @param {Number} seconds
	 * @param {Float} max set max to randomize between the fixed value and the max value
	 * @returns {_L1.SparkleEmitter.prototype}
	 */
	SparkleEmitter.prototype.setParticleLifetime = function(seconds,max) {
		
		if(max) 
			this.particle.max.lifetime = max;
	
		this.particle.default.lifetime = seconds;
		
		return this;
	};

	/**
	 * An emitter will fire particles forever (0) or for X Seconds
	 * After fireDuration is over and the emitter as no more particles
	 * to render, the property isAlive will be false
	 * @param {Number} duration - In Seconds
	 * @returns {_L1.SparkleEmitter.prototype}
	 */
	SparkleEmitter.prototype.setFireDuration = function(duration) {
		this.fireDuration = duration;
		return this;
	};

	/**
	 * Set the radius the particles should emit
	 * @param {Number} radius in degrees
	 * @returns {_L1.SparkleEmitter.prototype}
	 */
	SparkleEmitter.prototype.setRadius = function(radius) {
		this.radius = radius;
		return this;
	};
	/**
	 * Set a direction for the emitter
	 * @param {Number} direction in degrees
	 * @returns {_L1.SparkleEmitter.prototype}
	 */
	SparkleEmitter.prototype.setDirection = function(direction) {
		this.direction = direction;		
		return this;
	};
	
	/**
	 * A simple JavaSCript object with x and y to place or move the emitter
	 * on the canvas
	 * @param {Object} position as attributes: x,y in pixel
	 * @returns {_L1.SparkleEmitter.prototype}
	 */
	SparkleEmitter.prototype.setPosition = function(position) {
		this.position = position;
		return this;
	};
	
	/**
	 * Returns the position of the emitter as a JavaScript object
	 * @returns {_L1.SparkleEmitter.position}
	 */
	SparkleEmitter.prototype.getPosition = function() {
		return this.position;
	};

	/**
	 * Helps to generate random numbers
	 * @param {Number} start
	 * @param {Number} end
	 * @returns {Number}
	 */
	SparkleEmitter.prototype.randomBetween = function(start, end) {
		return Math.floor(Math.random() * (end - start + 1) + start);
	};

	/**
	 * Returns the age of a particle in seconds
	 * @param {Object} particle
	 * @returns {Float}
	 */
	SparkleEmitter.prototype.getParticleAge = function(particle) {
		return this.currentSecond - particle.born;
	};

	/**
	 * Is called when creating a particle to set the lifetimein seconds
	 * @returns {Number}
	 */
	SparkleEmitter.prototype.initialParticleLifetime = function() {
		
		if (this.particle.max.lifetime > 0) {
			
			return this.randomBetween(
					this.particle.default.lifetime, 
					this.particle.max.lifetime
					);
			
		} else {
			return this.particle.default.lifetime;
		}
	};

	/**
	 * Is called when creating a particle to set it's size
	 * @returns {Number}
	 */
	SparkleEmitter.prototype.initialParticleSize = function() {
		
		if (this.particle.max.size > 0) {

			return this.randomBetween(
					this.particle.default.size,
					this.particle.max.size
					);
		} else {
			return this.particle.default.size;
		}
	};

	/**
	 * Is called when creating aparticle to set it's direction to move
	 * @todo mathematisch mit sin und cosin ausrechen
	 * @returns {Number}
	 */
	SparkleEmitter.prototype.initialParticleDirection = function() {
		
		var halfRadius = this.radius / 2,
			left = this.direction - halfRadius,
			right = this.direction + halfRadius;
		
		return this.randomBetween(left, right);
	};

	/**
	 * Is called when creating a particle to set the speed of a particle
	 * Returns the movement per pixel ... you have to multiply with
	 * this.deltaSecond to adjust the speed by second
	 * @returns {Number}
	 */
	SparkleEmitter.prototype.initialParticleSpeed = function() {
		
		if (this.particle.max.speed > 0) {
			
			return this.randomBetween(
					this.particle.default.speed,
					this.particle.max.speed
					);
		} else {
			return this.particle.default.speed;
		}
		
	};
	
	/**
	 * Sets the initial spin for a particle
	 * @returns {Number}
	 */
	SparkleEmitter.prototype.initialParticleSpin = function() {
		
		if(this.particle.max.spin > 0) {
			
			return this.randomBetween(
					this.particle.default.spin,
					this.particle.max.spin
					);
		} else {
			return this.particle.default.spin;
		}
		
	};
	
	/**
	 * Initial Rotation. Helps to randomzie the initial rotation of particles
	 * @returns {Number}
	 */
	SparkleEmitter.prototype.initialParticleRotation = function() {
		
		if(this.particle.default.spin > 0) {
			return this.randomBetween(0,360);
		}
		
		return 0;
		
	};
	
	SparkleEmitter.prototype.initialParticlePosition = function() {

		if(this.size.width > 1 || this.size.height > 1) {
			
			var halfWidth = this.size.width/2,
				halfHeight = this.size.height/2;
			
			return {
				x: this.randomBetween(
						this.position.x - halfWidth,
						this.position.x + halfWidth
					), 
				y: this.randomBetween(
						this.position.y - halfHeight,
						this.position.y + halfHeight
					)
			};
			
		}
		
		return this.position;
		
	};
	
	/**
	 * Applies velocities for X and Y
	 * @param {Object} particle
	 * @returns {_L1.SparkleEmitter.prototype}
	 */
	SparkleEmitter.prototype.applyParticleVelocity = function(particle) {
		
		var radians = particle.direction * this.PI_180;

		particle.velocity.x = Math.cos(radians) * particle.speed;
		particle.velocity.y = Math.sin(radians) * particle.speed;

		return this;
	};
	
	/**
	 * On particle generation you can apply your own properties by replacing this function
	 * @argument {Object} particle object of the new particle
	 * @returns {_L1.SparkleEmitter.prototype.applyParticleVelocity}
	 */
	SparkleEmitter.prototype.attachParticleProperties = function(particle) {
		
		return this;
	};


	/**
	 * Modify this function to modify the behavior of your particles over time
	 * You can check the lifecycle to let the particle behave differently over time
	 * @param {Object} particle
	 * @returns {undefined}
	 */
	SparkleEmitter.prototype.modifyParticle = function(particle) {

		particle.x += particle.velocity.x * this.deltaSecond;
		particle.y += particle.velocity.y * this.deltaSecond;
		
		particle.velocity.y += this.gravity * this.deltaSecond;
		
		particle.rotation += particle.spin;
		
		switch (particle.lifecycle) {

			case this.PARTICLE_BORN:
				particle.opacity += 0.2;
				break;

			case this.PARTICLE_LIVING:

				break;

			case this.PARTICLE_DIEING:
				particle.opacity -= 0.05;
				break;
		}

		return this;
	};

	/**
	 * Control the lifecycle of an particle with if statements on particle attributes
	 * Look at modifyParticle to see how the particle attributes are modified and
	 * checked again in this function
	 * @param {Object} particle
	 * @returns {Integer}
	 */
	SparkleEmitter.prototype.particleLifecycle = function(particle) {

		if (particle.lifecycle >= this.PARTICLE_BORN) {

			if (particle.opacity >= 1
					&& particle.lifecycle === this.PARTICLE_BORN) {

				particle.lifecycle = this.PARTICLE_LIVING;
			}
			if (this.getParticleAge(particle) >= particle.lifetime
					&& particle.lifecycle === this.PARTICLE_LIVING) {

				particle.lifecycle = this.PARTICLE_DIEING;
			}

			if (particle.opacity <= 0
					&& particle.lifecycle === this.PARTICLE_DIEING) {

				particle.lifecycle = this.PARTICLE_DEAD;
			}

		}

		return particle.lifecycle;
	};

	/**
	 * Renders all particles in our particle list
	 * @returns {_L1.SparkleEmitter.prototype}
	 */
	SparkleEmitter.prototype.renderParticles = function() {

		if (this.particles.length > 0) {

			for (var iteration = 0; iteration < this.particles.length; iteration++) {

				var particle = this.particles[iteration];

				if (particle.lifecycle >= this.PARTICLE_BORN) {
					this.renderParticle(particle);
					this.modifyParticle(particle);
					this.particleLifecycle(particle);
					particle.frame++;
				}

			} // render each particle

		} // only loop through particles if we have particles

		// do garbage collection for all dead particles - second for loop
		// is to not inteferrier with the rendering process
		for (var iteration = 0; iteration < this.particles.length; iteration++) {

			if (!this.particles[iteration].lifecycle) {
				this.particles.splice(iteration, 1);
			}
		}

		return this;
	};

	/**
	 * Renders one particle directly on the canvas
	 * @param {type} particle
	 * @returns {_L1.SparkleEmitter.prototype}
	 */
	SparkleEmitter.prototype.renderParticle = function(particle) {

		this.context.save();

		var particleCenter = (particle.size/2),
			centerX = particle.x-particleCenter,
			centerY = particle.y-particleCenter;
		
		this.context.globalAlpha = particle.opacity;
		this.context.translate(centerX, centerY);
		this.context.translate(particleCenter,particleCenter); 
		this.context.rotate(particle.rotation*this.PI_180);
		
		this.drawParticle(
			-particleCenter,
			-particleCenter,
			particle
		);
		
		if(this.debug) {
			this.context.font = "8px sans-serif";
			this.context.fillText(particle.speed, particle.x+particle.size+2, particle.y);
		}
		
		this.context.restore();

		return this;
	};
	
	SparkleEmitter.prototype.drawParticle = function(x,y,particle) {
		
		this.context.beginPath();
		this.context.arc(
			x,
			y,
			particle.size/2,
			0, 
			Math.PI * 2
			);
		this.context.fillStyle = '#fff';
		this.context.fill();
		
		return this;
	};

	/**
	 * Adds a specific amount of particles to every frame
	 * or skips some frames to produce less particles
	 * @returns {_L1.SparkleEmitter.prototype}
	 */
	SparkleEmitter.prototype.addParticles = function() {

		this.numNewParticles += this.particlesPerSecond * this.deltaSecond;
		
		if (this.numNewParticles > 1) { 
			for (var iteration = 0; iteration < this.numNewParticles; iteration++) {
				this.addParticle();
			}
			this.numNewParticles = 0;
		}

		return this;
	};

	/**
	 * Adds a new particle to the emitter
	 * @returns {_L1.SparkleEmitter.prototype}
	 */
	SparkleEmitter.prototype.addParticle = function() {
		
		var position = this.initialParticlePosition();
		
		var newParticle = {
			x: position.x,
			y: position.y,
			born: this.currentSecond,
			lifecycle: this.PARTICLE_BORN,
			frame: 0,
			opacity: 0,
			direction: this.initialParticleDirection(),
			speed: this.initialParticleSpeed(),
			lifetime: this.initialParticleLifetime() * 1000,
			size: this.initialParticleSize(),
			spin: this.initialParticleSpin(),
			rotation: this.initialParticleRotation(),
			velocity: {
				x: 0,
				y: 0
			}
		};
		
		this.attachParticleProperties(newParticle)
			.applyParticleVelocity(newParticle);

		this.particles.push(newParticle);

		return this;
	};

	/**
	 * Implement this in your setInterval/Loop - don't forget
	 * to tell sparkle your framerate
	 * @param {Integer} timestamp request Animation frame timestmap
	 * @returns {_L1.SparkleEmitter.prototype}
	 */
	SparkleEmitter.prototype.fire = function(timestamp) {

		this.currentSecond = this.getTime();
		this.deltaSecond = (this.currentSecond - this.pastSecond) / 1000;

		this.lifetime = (this.currentSecond - this.startSecond) / 1000;
		
		if(this.fireDuration > 0) {
			this.createParticles = this.fireDuration >= this.lifetime;
		}

		// respect the limit of particles
		if (this.particles.length < this.maxParticles && this.createParticles) {
			// add new particles based on particlesPerSecond
			this.addParticles();
		}

		// render all partctiles in the particles array
		this.renderParticles();
		
		if(this.createParticles === false && this.particles.length === 0 ) {
			this.isAlive = false;
		}

		// save the second before
		this.pastSecond = this.currentSecond;

		return this;
	};

	window.SparkleEmitter = SparkleEmitter;

})(window);