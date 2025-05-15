export class Player {
    constructor(x, y, width, height, game) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = 0;
        this.maxSpeed = 5;
        this.jumpForce = -12;
        this.velocityX = 0;
        this.velocityY = 0;
        this.weight = 1;
        this.health = 100;
        this.energy = 100;
        this.isGrounded = false;
        this.isFalling = false;
        this.isJumping = false;
        this.facingRight = true;
        
        console.log("玩家已创建");
    }
    
    update(deltaTime, input) {
        // 处理输入
        this.handleInput(input);
        
        // 应用重力
        if (!this.isGrounded) {
            this.velocityY += this.weight;
            this.isFalling = this.velocityY > 0;
        } else {
            this.isFalling = false;
            this.isJumping = false;
        }
        
        // 移动玩家
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // 摩擦力
        this.velocityX *= this.game.friction;
        
        // 边界检查
        this.checkBoundaries();
        
        // 碰撞检测
        this.checkCollisions();
    }
    
    handleInput(keys) {
        // 左右移动
        if (keys.ArrowRight) {
            this.velocityX = this.maxSpeed;
            this.facingRight = true;
        } else if (keys.ArrowLeft) {
            this.velocityX = -this.maxSpeed;
            this.facingRight = false;
        }
        
        // 跳跃
        if (keys[' '] && this.isGrounded && !this.isJumping) {
            this.velocityY = this.jumpForce;
            this.isGrounded = false;
            this.isJumping = true;
            console.log("跳跃!");
        }
        
        // 攻击
        if (keys.z) {
            console.log("攻击!");
        }
        
        // 特殊技能
        if (keys.x) {
            console.log("使用特殊技能!");
        }
    }
    
    checkBoundaries() {
        // 限制在游戏区域内
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > this.game.gameWidth) {
            this.x = this.game.gameWidth - this.width;
        }
        
        // 底部边界 - 游戏区域下方导致重置位置
        if (this.y > this.game.gameHeight) {
            // 重置到初始生成位置附近的高度，相对于groundLevel
            this.y = this.game.groundLevel - 200; 
            this.velocityY = 0;
        }
    }
    
    checkCollisions() {
        // 简单的地面碰撞 - 使用游戏中的groundLevel
        if (this.y + this.height > this.game.groundLevel) {
            this.y = this.game.groundLevel - this.height;
            this.velocityY = 0;
            this.isGrounded = true;
        } else {
            this.isGrounded = false;
        }
    }
    
    collidesWith(object) {
        return (
            this.x < object.x + object.width &&
            this.x + this.width > object.x &&
            this.y < object.y + object.height &&
            this.y + this.height > object.y
        );
    }
    
    draw(ctx) {
        // 绘制火柴人
        ctx.save();
        
        // 根据朝向翻转
        if (!this.facingRight) {
            ctx.translate(this.x + this.width, 0);
            ctx.scale(-1, 1);
            ctx.translate(-this.x, 0);
        }
        
        // 头部
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + 15, 10, 0, Math.PI * 2);
        ctx.fillStyle = '#000';
        ctx.fill();
        
        // 身体
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y + 25);
        ctx.lineTo(this.x + this.width / 2, this.y + 50);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 手臂
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y + 35);
        ctx.lineTo(this.x + this.width / 2 + 15, this.y + 30);
        ctx.moveTo(this.x + this.width / 2, this.y + 35);
        ctx.lineTo(this.x + this.width / 2 - 15, this.y + 30);
        ctx.stroke();
        
        // 腿部
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y + 50);
        ctx.lineTo(this.x + this.width / 2 + 10, this.y + 70);
        ctx.moveTo(this.x + this.width / 2, this.y + 50);
        ctx.lineTo(this.x + this.width / 2 - 10, this.y + 70);
        ctx.stroke();
        
        ctx.restore();
    }
} 