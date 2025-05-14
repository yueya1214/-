export class Particle {
    constructor(x, y, color, game) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.size = Math.random() * 10 + 5;
        this.speedX = Math.random() * 6 - 3;
        this.speedY = Math.random() * 6 - 3;
        this.color = color;
        this.alpha = 1;
        this.gravity = 0.1;
        this.friction = 0.95;
        this.fadeSpeed = Math.random() * 0.05 + 0.01;
    }
    
    update() {
        // 应用重力
        this.speedY += this.gravity;
        
        // 应用摩擦力
        this.speedX *= this.friction;
        this.speedY *= this.friction;
        
        // 移动粒子
        this.x += this.speedX;
        this.y += this.speedY;
        
        // 粒子淡出
        this.alpha -= this.fadeSpeed;
        
        // 粒子缩小
        if (this.size > 0.5) this.size -= 0.1;
    }
    
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
} 