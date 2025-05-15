export class Player {
    constructor(x, y, width, height, game) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        
        // 优化移动和跳跃参数
        this.speed = 0;
        this.maxSpeed = 4; // 降低最大速度使控制更精确
        this.jumpForce = -10; // 降低初始跳跃力，使跳跃不那么突兀
        this.doubleJumpForce = -8; // 二段跳的力度
        this.velocityX = 0;
        this.velocityY = 0;
        this.weight = 0.5; // 降低重力影响，使跳跃更高
        this.terminalVelocity = 10; // 最大下落速度，防止下落过快
        
        // 玩家状态
        this.health = 100;
        this.energy = 100;
        this.isGrounded = false;
        this.isFalling = false;
        this.isJumping = false;
        this.canDoubleJump = false; // 是否可以二段跳
        this.hasDoubleJumped = false; // 是否已经使用二段跳
        this.facingRight = true;
        
        // 碰撞检测辅助变量
        this.lastPlatform = null; // 上次碰撞的平台
        
        console.log("玩家已创建");
    }
    
    update(deltaTime, input) {
        const oldY = this.y; // 存储更新前的Y位置
        
        // 处理输入
        this.handleInput(input);
        
        // 应用重力
        if (!this.isGrounded) {
            this.velocityY += this.weight;
            // 限制下落速度
            if (this.velocityY > this.terminalVelocity) {
                this.velocityY = this.terminalVelocity;
            }
            this.isFalling = this.velocityY > 0;
        } else {
            this.isFalling = false;
            this.isJumping = false;
            this.hasDoubleJumped = false;
            this.canDoubleJump = false;
        }
        
        // 移动玩家
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // 摩擦力
        this.velocityX *= this.game.friction;
        
        // 边界检查
        this.checkBoundaries();
        
        // 平台碰撞检测（从玩家class中独立出来，改为检查所有平台）
        this.isGrounded = false; // 默认不在地面上
        this.checkPlatformCollisions();
        
        // 如果之前不在地面上，现在在地面上，表示刚刚落地
        if (oldY !== this.y && this.isGrounded && this.velocityY >= 0) {
            this.velocityY = 0;
            // 刚刚落地的效果（如声音、动画等）可以在这里添加
        }
    }
    
    handleInput(keys) {
        // 左右移动
        if (keys.ArrowRight) {
            // 加速效果 - 长按加速
            const acceleration = this.game.input.isKeyHeld('ArrowRight', 300) ? 1.2 : 1.0;
            this.velocityX = this.maxSpeed * acceleration;
            this.facingRight = true;
        } else if (keys.ArrowLeft) {
            // 加速效果 - 长按加速
            const acceleration = this.game.input.isKeyHeld('ArrowLeft', 300) ? 1.2 : 1.0;
            this.velocityX = -this.maxSpeed * acceleration;
            this.facingRight = false;
        }
        
        // 跳跃处理 - 根据按键状态调整跳跃
        // 1. 刚刚按下空格，且在地面上
        if (this.game.input.jumpPressed && this.isGrounded && !this.isJumping) {
            this.jump();
            this.game.input.jumpPressed = false; // 消耗这个跳跃输入
        } 
        // 2. 空中二段跳 - 在空中再次按下空格键
        else if (this.game.input.jumpPressed && !this.isGrounded && !this.hasDoubleJumped && this.canDoubleJump) {
            this.doubleJump();
            this.game.input.jumpPressed = false; // 消耗这个跳跃输入
        }
        
        // 3. 跳跃高度控制 - 提前释放跳跃键会减小跳跃高度
        if (!keys[' '] && this.isJumping && this.velocityY < 0) {
            // 降低上升速度，实现短跳
            this.velocityY *= 0.85;
        }
        
        // 攻击
        if (keys.z) {
            // 只在刚按下时触发一次攻击
            if (this.game.input.isKeyJustPressed('z')) {
                console.log("攻击!");
            }
        }
        
        // 特殊技能
        if (keys.x) {
            // 只在刚按下时触发一次特殊技能
            if (this.game.input.isKeyJustPressed('x')) {
                console.log("使用特殊技能!");
            }
        }
    }
    
    jump() {
        this.velocityY = this.jumpForce;
        this.isGrounded = false;
        this.isJumping = true;
        this.canDoubleJump = true; // 允许在空中进行二段跳
        console.log("跳跃!");
    }
    
    doubleJump() {
        this.velocityY = this.doubleJumpForce;
        this.hasDoubleJumped = true;
        console.log("二段跳!");
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
    
    checkPlatformCollisions() {
        // 检查与所有平台的碰撞
        if (this.game.level && this.game.level.platforms) {
            for (let i = 0; i < this.game.level.platforms.length; i++) {
                const platform = this.game.level.platforms[i];
                
                // 检查是否与平台碰撞
                if (this.collidesWith(platform)) {
                    // 检查碰撞方向
                    
                    // 1. 从上方碰撞（落在平台上）
                    if (this.velocityY >= 0 && // 正在下落
                        this.y + this.height - this.velocityY <= platform.y) { // 之前位置在平台上方
                        
                        this.y = platform.y - this.height;
                        this.isGrounded = true;
                        this.lastPlatform = platform;
                        
                        // 应用平台的摩擦力特性
                        if (platform.friction) {
                            this.velocityX *= platform.friction;
                        }
                    }
                    // 2. 从下方碰撞（撞到平台底部）
                    else if (this.velocityY < 0 && // 正在上升
                            !platform.passThrough && // 平台不可穿过
                            this.y >= platform.y + platform.height - this.velocityY) { // 之前位置在平台下方
                            
                        this.y = platform.y + platform.height;
                        this.velocityY = 0; // 停止上升
                    }
                    // 3. 从侧面碰撞（撞到平台侧面）
                    else if (!platform.passThrough) {
                        // 从左侧碰撞
                        if (this.velocityX > 0 && this.x + this.width - this.velocityX <= platform.x) {
                            this.x = platform.x - this.width;
                            this.velocityX = 0;
                        }
                        // 从右侧碰撞
                        else if (this.velocityX < 0 && this.x - this.velocityX >= platform.x + platform.width) {
                            this.x = platform.x + platform.width;
                            this.velocityX = 0;
                        }
                    }
                }
            }
        }
        
        // 如果没有与任何平台碰撞，并且到达了地面高度，就站在地面上
        if (!this.isGrounded && this.y + this.height >= this.game.groundLevel) {
            this.y = this.game.groundLevel - this.height;
            this.isGrounded = true;
            this.velocityY = 0;
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
        
        // 在绘制之前，可以添加调试信息
        if (this.game.DEBUG) {
            // 绘制碰撞箱
            ctx.strokeStyle = 'red';
            ctx.beginPath();
            ctx.rect(this.x, this.y, this.width, this.height);
            ctx.stroke();
            
            // 绘制状态文本
            ctx.fillStyle = 'white';
            ctx.font = '10px Arial';
            ctx.fillText(`地面: ${this.isGrounded}`, this.x, this.y - 20);
            ctx.fillText(`跳跃: ${this.isJumping}`, this.x, this.y - 10);
            ctx.fillText(`速度Y: ${Math.round(this.velocityY)}`, this.x, this.y);
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