class Car {
    constructor(x, y, width, height, controlType, maxSpeed = 3) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.speed = 0;
        this.acceleration = 0.2;
        this.maxSpeed = maxSpeed;
        this.friction = 0.05;
        this.angle = 0;
        this.damaged = false;

        // Only main car has sensor
        if(controlType === 'KEYS') this.sensor = new Sensor(this);
        this.controls = new Controls(controlType);
    }

    draw(ctx, color) {
        if(this.damaged) ctx.fillStyle = 'gray';
        else ctx.fillStyle = color;

        ctx.beginPath();
        ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
        for(let i = 1; i < this.polygon.length; i++) {
            ctx.lineTo(this.polygon[i].x, this.polygon[i].y);
        }
        ctx.fill();

        if(this.sensor) this.sensor.draw(ctx);
    }

    // Main function for car
    update(roadBorders, traffic) {
        if(!this.damaged) {
            this.#move();
            this.polygon = this.#createPolygon();
            this.damaged = this.#assessDamage(roadBorders, traffic);    
        }

        if(this.sensor) this.sensor.update(roadBorders, traffic);
    }

    #move() {
        if(this.controls.forward) this.speed += this.acceleration;
        if(this.controls.reverse) this.speed -= this.acceleration;
        if(this.speed != 0) { // logic for backwards turns
            const flip = this.speed > 0 ? 1 : -1;
            if(this.controls.left) this.angle += 0.03 * flip;
            if(this.controls.right) this.angle -= 0.03 * flip;
        }

        // Rotate mechanics using unit circle
        this.x -= Math.sin(this.angle) * this.speed;
        this.y -= Math.cos(this.angle) * this.speed;

        if(this.speed > this.maxSpeed) this.speed = this.maxSpeed;
        if(this.speed < -this.maxSpeed) this.speed = -this.maxSpeed; // account for backward direction
        if(this.speed > 0) this.speed -= this.friction;
        if(this.speed < 0) this.speed += this.friction;
        
        if(Math.abs(this.speed) < this.friction) this.speed = 0; // edge case
    }

    #createPolygon() {
        const points = [];
        const radius = Math.hypot(this.width, this.height)/2;
        const alphaAngle = Math.atan2(this.width, this.height);
        // Top Right point start
        points.push({
            x: this.x - Math.sin(this.angle - alphaAngle) * radius,
            y: this.y - Math.cos(this.angle - alphaAngle) * radius,
        });
        points.push({
            x: this.x - Math.sin(this.angle + alphaAngle) * radius,
            y: this.y - Math.cos(this.angle + alphaAngle) * radius,
        });
        points.push({
            x: this.x - Math.sin(Math.PI + this.angle - alphaAngle) * radius,
            y: this.y - Math.cos(Math.PI + this.angle - alphaAngle) * radius,
        });
        points.push({
            x: this.x - Math.sin(Math.PI + this.angle + alphaAngle) * radius,
            y: this.y - Math.cos(Math.PI + this.angle + alphaAngle) * radius,
        });
        return points;
    }

    #assessDamage(roadBorders, traffic) {
        for(let i = 0; i < roadBorders.length; i++) {
            if(polysIntersect(this.polygon, roadBorders[i])) return true;
        }
        for(let i = 0; i < traffic.length; i++) {
            if(polysIntersect(this.polygon, traffic[i].polygon)) return true;
        }
        return false;
    }
}