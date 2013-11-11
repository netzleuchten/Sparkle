(function(window) {

	/**
	 *
	 * @param {dom} canvas HTML Element
	 * @returns {_L1.SparkleEmitter}
	 */
	var SparkleEmitter = function(canvas) {
		// every prototype parameter wich has to be local for an instance
		// should be redefined/set here
		this.context = canvas.getContext('2d');
		
		this.debug = false;
		
		this.createParticles = true;

		// default values made local SparkleEmitter.prototype.
		this.particles = [];
		this.currentFrame = 1;

		this.startSecond = this.getTime();

		this.currentSecond = this.getTime();
		this.pastSecond = this.getTime();
		this.deltaSecond = 1;
		
		this.position = {x: canvas.width/2, y: canvas.height/2};
		
		this.lifetime = 0;
		this.isAlive = true;
		this.gravity = 0;
		
		this.particleCounter = 0;
	};

	// Constants
	SparkleEmitter.prototype.PARTICLE_BORN = 1;
	SparkleEmitter.prototype.PARTICLE_LIVING = 2;
	SparkleEmitter.prototype.PARTICLE_DIEING = 3;
	SparkleEmitter.prototype.PARTICLE_DEAD = 0;

	// Emitter configuration
	SparkleEmitter.prototype.fireDuration = 0;
	SparkleEmitter.prototype.maxParticles = 999999;
	SparkleEmitter.prototype.radius = 90;
	SparkleEmitter.prototype.direction = 90;
	SparkleEmitter.prototype.particlesPerSecond = 60;
	SparkleEmitter.prototype.position = {x: 0, y: 0};
	SparkleEmitter.prototype.gravity = 0;

	// internal data
	SparkleEmitter.prototype.context = null;
	SparkleEmitter.prototype.currentFrame = 0;
	SparkleEmitter.prototype.particles = [];

	// parameters for rendering
	SparkleEmitter.prototype.isAlive = true;
	SparkleEmitter.prototype.createParticles = true;
	SparkleEmitter.prototype.lifetime = 0;
	SparkleEmitter.prototype.startSecond = 0;
	SparkleEmitter.prototype.currentSecond = 0;
	SparkleEmitter.prototype.pastSecond = 0;
	SparkleEmitter.prototype.deltaSecond = 0;
	
	SparkleEmitter.prototype.getTime = function() {
		return window.performance.now ?
			// Some browsers use high-precision timers
			(performance.now() + performance.timing.navigationStart) : 
			Date.now(); // A fallback for those that don't
	};
	
	SparkleEmitter.prototype.setParticlesPerSecond = function(count) {
		this.particlesPerSecond = count;
		return this;
	};
	
	SparkleEmitter.prototype.setGravity = function(gravity) {
		this.gravity = gravity;
		return this;
	};
	
	SparkleEmitter.prototype.setMaxParticles = function(max) {
		this.maxParticles = max;
		return this;
	};

	SparkleEmitter.prototype.setFireDuration = function(duration) {
		this.fireDuration = duration;
		return this;
	};

	SparkleEmitter.prototype.setRadius = function(radius) {
		this.radius = radius;
		return this;
	};

	SparkleEmitter.prototype.setDirection = function(direction) {
		this.direction = direction;
		return this;
	};

	SparkleEmitter.prototype.setPosition = function(position) {
		this.position = position;
		return this;
	};

	SparkleEmitter.prototype.getPosition = function() {
		return this.position;
	};

	/**
	 * Helps to generate random integer numbers
	 * @param {type} start
	 * @param {type} end
	 * @returns {@exp;Math@call;floor}
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
		return this.randomBetween(0, 0.5);
	};

	/**
	 * Is called when creating a particle to set it's size
	 * @returns {Number}
	 */
	SparkleEmitter.prototype.initialParticleSize = function() {
		return this.randomBetween(5, 8);
	};

	/**
	 * Is calledn when creating aparticle to set it's angle to move
	 * @returns {Number}
	 */
	SparkleEmitter.prototype.initialParticleAngle = function() {
		return this.randomBetween(-85, -95);
	};

	/**
	 * Is called when creating a particle to set the speed of a particle
	 * Returns the movement per pixel ... you have to multiply with
	 * this.deltaSecond to adjust the speed by second
	 * @returns {Number}
	 */
	SparkleEmitter.prototype.initialParticleSpeed = function() {
		return this.randomBetween(150, 160);
	};
	
	/**
	 * Applies velocities for X and Y
	 * @param {Object} particle
	 * @returns {_L1.SparkleEmitter.prototype}
	 */
	SparkleEmitter.prototype.applyParticleVelocity = function(particle) {
		
		var radians = particle.angle * Math.PI / 180;

		particle.velocity.x = Math.cos(radians) * particle.speed;
		particle.velocity.y = Math.sin(radians) * particle.speed;

		return this;
	};
	
	/**
	 * On particle generation you can apply your own properties by replacing this function
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
		
		particle.velocity.y += this.gravity;

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
	 * @returns {undefined}
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
	 * @returns {undefined}
	 */
	SparkleEmitter.prototype.renderParticle = function(particle) {

		this.context.save();

		this.context.globalAlpha = particle.opacity;

		var particleCenter = (particle.size/2);
					
		this.drawParticle(
			particle.x-particleCenter,
			particle.y-particleCenter,
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

		var numNewParticles = this.particlesPerSecond * this.deltaSecond;

		if (numNewParticles > 0) {
			for (var iteration = 0; iteration < numNewParticles; iteration++) {
				this.addParticle();
			}
		}

		return this;
	};

	/**
	 * Adds a new particle to the emitter
	 * @returns {_L1.SparkleEmitter.prototype}
	 */
	SparkleEmitter.prototype.addParticle = function() {
		
		var newParticle = {
			x: this.position.x,
			y: this.position.y,
			born: this.currentSecond,
			lifecycle: this.PARTICLE_BORN,
			frame: 0,
			opacity: 0,
			angle: this.initialParticleAngle(),
			speed: this.initialParticleSpeed(),
			lifetime: this.initialParticleLifetime() * 1000,
			size: this.initialParticleSize(),
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

		// we calcualte a delta for the passed time to
		// create movements basend on seconds, not on framerate
		//this.currentSecond = this.currentFrame/this.framesPerSecond;
		this.currentSecond = this.getTime();
		this.deltaSecond = (this.currentSecond - this.pastSecond) / 1000;

		this.emitterLifeTime = (this.currentSecond - this.startSecond) / 1000;
		
		if(this.fireDuration > 0) {
			this.createParticles = this.fireDuration >= this.emitterLifeTime;
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
		
		// raise the current frame for calculation
		this.currentFrame++;

		// save the second before
		this.pastSecond = this.currentSecond;

		return this;
	};

	window.SparkleEmitter = SparkleEmitter;

})(window);