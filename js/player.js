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
        this.energyRegenRate = 0.1;
        this.attackCooldown = 0;
        this.attackDuration = 0;
        this.isAttacking = false;
        this.specialCooldown = 0;
        this.specialCost = 30;
        this.isUsingSpecial = false;
        this.specialDuration = 0;
        this.damage = 20;
        this.specialDamage = 40;
        this.hitboxWidth = 30;
        this.hitboxHeight = 60;
        this.isGrounded = false;
        this.isFalling = false;
        this.isJumping = false;
        this.facingRight = true;
        this.invulnerable = false;
        this.invulnerabilityTime = 0;
        this.maxInvulnerabilityTime = 60;
        this.knockbackForce = 8;
        
        // 动画状态
        this.states = {
            IDLE: 'idle',
            RUNNING: 'running',
            JUMPING: 'jumping',
            FALLING: 'falling',
            ATTACKING: 'attacking',
            SPECIAL: 'special',
            HURT: 'hurt'
        };
        this.currentState = this.states.IDLE;
        
        // 简单动画系统
        this.frameX = 0;
        this.frameY = 0;
        this.maxFrames = 5;
        this.frameTimer = 0;
        this.frameInterval = 100; // 毫秒
        
        // 初始化火柴人图像（简化处理，直接绘制）
        this.sprites = {
            idle: { frames: 1 },
            running: { frames: 6 },
            jumping: { frames: 1 },
            falling: { frames: 1 },
            attacking: { frames: 3 },
            special: { frames: 5 },
            hurt: { frames: 1 }
        };
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
        
        // 更新攻击冷却
        if (this.attackCooldown > 0) {
            this.attackCooldown -= deltaTime;
        }
        
        // 更新攻击持续时间
        if (this.attackDuration > 0) {
            this.attackDuration -= deltaTime;
            if (this.attackDuration <= 0) {
                this.isAttacking = false;
            }
        }
        
        // 更新特殊攻击冷却
        if (this.specialCooldown > 0) {
            this.specialCooldown -= deltaTime;
        }
        
        // 更新特殊攻击持续时间
        if (this.specialDuration > 0) {
            this.specialDuration -= deltaTime;
            if (this.specialDuration <= 0) {
                this.isUsingSpecial = false;
            }
        }
        
        // 恢复能量
        if (this.energy < 100 && !this.isUsingSpecial) {
            this.energy += this.energyRegenRate;
            if (this.energy > 100) this.energy = 100;
            this.game.ui.updateEnergy(this.energy);
        }
        
        // 更新无敌时间
        if (this.invulnerable) {
            this.invulnerabilityTime -= deltaTime;
            if (this.invulnerabilityTime <= 0) {
                this.invulnerable = false;
            }
        }
        
        // 边界检查
        this.checkBoundaries();
        
        // 碰撞检测
        this.checkCollisions();
        
        // 更新玩家状态
        this.updateState();
        
        // 更新动画
        this.updateAnimation(deltaTime);
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
            this.game.soundManager.playSound('jump');
        }
        
        // 攻击
        if (keys.z && this.attackCooldown <= 0 && !this.isAttacking) {
            this.attack();
        }
        
        // 特殊技能
        if (keys.x && this.specialCooldown <= 0 && this.energy >= this.specialCost && !this.isUsingSpecial) {
            this.useSpecial();
        }
    }
    
    attack() {
        this.isAttacking = true;
        this.attackCooldown = 500; // 0.5秒冷却
        this.attackDuration = 300; // 0.3秒攻击动作
        this.game.soundManager.playSound('attack');
        
        // 检查是否击中敌人
        this.game.enemies.forEach(enemy => {
            if (this.isAttackHitting(enemy)) {
                enemy.takeDamage(this.damage);
                this.game.createParticles(
                    enemy.x, 
                    enemy.y, 
                    5, 
                    '#ffaa00'
                );
            }
        });
    }
    
    useSpecial() {
        this.isUsingSpecial = true;
        this.specialCooldown = 2000; // 2秒冷却
        this.specialDuration = 500; // 0.5秒特殊动作
        this.energy -= this.specialCost;
        this.game.ui.updateEnergy(this.energy);
        this.game.soundManager.playSound('special');
        
        // 特殊技能效果 - 范围攻击
        this.game.enemies.forEach(enemy => {
            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 150) { // 范围攻击半径
                enemy.takeDamage(this.specialDamage);
                
                // 击退效果
                const knockbackX = dx / distance * this.knockbackForce;
                const knockbackY = dy / distance * this.knockbackForce;
                enemy.velocityX = knockbackX;
                enemy.velocityY = knockbackY;
                
                this.game.createParticles(
                    enemy.x, 
                    enemy.y, 
                    10, 
                    '#3399ff'
                );
            }
        });
        
        // 创建特效
        this.game.createParticles(
            this.x, 
            this.y, 
            20, 
            '#3399ff'
        );
    }
    
    isAttackHitting(enemy) {
        // 攻击范围计算
        let attackRange = 30;
        let attackX = this.facingRight ? this.x + this.width/2 : this.x - attackRange;
        
        return (
            (this.facingRight ? 
                (attackX < enemy.x + enemy.width && this.x + this.width > enemy.x) :
                (attackX + attackRange > enemy.x && this.x < enemy.x + enemy.width)
            ) &&
            this.y + this.hitboxHeight > enemy.y &&
            this.y < enemy.y + enemy.height
        );
    }
    
    checkBoundaries() {
        // 限制在游戏区域内
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > this.game.gameWidth) {
            this.x = this.game.gameWidth - this.width;
        }
        
        // 底部边界 - 游戏区域下方导致死亡
        if (this.y > this.game.gameHeight) {
            this.takeDamage(100); // 立即死亡
        }
    }
    
    checkCollisions() {
        // 与平台的碰撞
        this.isGrounded = false;
        
        this.game.level.platforms.forEach(platform => {
            if (this.collidesWith(platform)) {
                // 从上方碰撞
                if (this.velocityY > 0 && 
                    this.y + this.height - this.velocityY <= platform.y) {
                    this.isGrounded = true;
                    this.y = platform.y - this.height;
                    this.velocityY = 0;
                }
                // 从下方碰撞
                else if (this.velocityY < 0 &&
                        this.y >= platform.y + platform.height) {
                    this.y = platform.y + platform.height;
                    this.velocityY = 0;
                }
                // 从左侧碰撞
                else if (this.velocityX > 0 && 
                        this.x + this.width - this.velocityX <= platform.x) {
                    this.x = platform.x - this.width;
                }
                // 从右侧碰撞
                else if (this.velocityX < 0 && 
                        this.x >= platform.x + platform.width) {
                    this.x = platform.x + platform.width;
                }
            }
        });
        
        // 与敌人的碰撞
        if (!this.invulnerable) {
            this.game.enemies.forEach(enemy => {
                if (this.collidesWith(enemy)) {
                    this.takeDamage(enemy.contactDamage);
                    
                    // 击退
                    const direction = this.x < enemy.x ? -1 : 1;
                    this.velocityX = direction * this.knockbackForce;
                    this.velocityY = -this.knockbackForce / 2;
                }
            });
        }
    }
    
    collidesWith(object) {
        return (
            this.x < object.x + object.width &&
            this.x + this.hitboxWidth > object.x &&
            this.y < object.y + object.height &&
            this.y + this.hitboxHeight > object.y
        );
    }
    
    takeDamage(amount) {
        if (!this.invulnerable) {
            this.health -= amount;
            if (this.health < 0) this.health = 0;
            
            this.game.ui.updateHealth(this.health);
            this.game.soundManager.playSound('hurt');
            
            // 受伤动画和无敌时间
            this.currentState = this.states.HURT;
            this.invulnerable = true;
            this.invulnerabilityTime = this.maxInvulnerabilityTime;
            
            // 创建受伤粒子效果
            this.game.createParticles(
                this.x + this.width/2, 
                this.y + this.height/2, 
                10, 
                '#ff3333'
            );
        }
    }
    
    updateState() {
        // 更新当前状态
        if (this.isAttacking) {
            this.currentState = this.states.ATTACKING;
        } else if (this.isUsingSpecial) {
            this.currentState = this.states.SPECIAL;
        } else if (this.isJumping) {
            this.currentState = this.states.JUMPING;
        } else if (this.isFalling) {
            this.currentState = this.states.FALLING;
        } else if (Math.abs(this.velocityX) > 0.5) {
            this.currentState = this.states.RUNNING;
        } else {
            this.currentState = this.states.IDLE;
        }
    }
    
    updateAnimation(deltaTime) {
        // 更新帧率
        this.frameTimer += deltaTime;
        
        if (this.frameTimer > this.frameInterval) {
            this.frameTimer = 0;
            
            if (this.frameX < this.sprites[this.currentState].frames - 1) {
                this.frameX++;
            } else {
                this.frameX = 0;
            }
        }
        
        // 根据状态设置帧行
        switch (this.currentState) {
            case this.states.IDLE:
                this.frameY = 0;
                break;
            case this.states.RUNNING:
                this.frameY = 1;
                break;
            case this.states.JUMPING:
                this.frameY = 2;
                break;
            case this.states.FALLING:
                this.frameY = 3;
                break;
            case this.states.ATTACKING:
                this.frameY = 4;
                break;
            case this.states.SPECIAL:
                this.frameY = 5;
                break;
            case this.states.HURT:
                this.frameY = 6;
                break;
            default:
                this.frameY = 0;
        }
    }
    
    draw(ctx) {
        // 闪烁效果（受伤无敌时间）
        if (this.invulnerable && Math.floor(this.invulnerabilityTime / 5) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }
        
        // 绘制火柴人（使用简单图形代替精灵图）
        ctx.save();
        
        // 根据朝向翻转
        if (!this.facingRight) {
            ctx.translate(this.x + this.width, 0);
            ctx.scale(-1, 1);
            ctx.translate(-this.x, 0);
        }
        
        // 根据状态绘制不同姿势的火柴人
        switch (this.currentState) {
            case this.states.IDLE:
                this.drawStickmanIdle(ctx);
                break;
            case this.states.RUNNING:
                this.drawStickmanRunning(ctx);
                break;
            case this.states.JUMPING:
            case this.states.FALLING:
                this.drawStickmanJumping(ctx);
                break;
            case this.states.ATTACKING:
                this.drawStickmanAttacking(ctx);
                break;
            case this.states.SPECIAL:
                this.drawStickmanSpecial(ctx);
                break;
            case this.states.HURT:
                this.drawStickmanHurt(ctx);
                break;
            default:
                this.drawStickmanIdle(ctx);
        }
        
        ctx.restore();
        ctx.globalAlpha = 1;
        
        // 调试 - 显示碰撞箱
        if (false) { // 设为true启用调试
            ctx.strokeStyle = 'red';
            ctx.strokeRect(this.x, this.y, this.hitboxWidth, this.hitboxHeight);
        }
    }
    
    // 绘制各种姿势的火柴人
    drawStickmanIdle(ctx) {
        const x = this.x + this.width / 2;
        const y = this.y + this.height / 2;
        
        // 头部
        ctx.beginPath();
        ctx.arc(x, y - 25, 10, 0, Math.PI * 2);
        ctx.fillStyle = '#000';
        ctx.fill();
        
        // 身体
        ctx.beginPath();
        ctx.moveTo(x, y - 15);
        ctx.lineTo(x, y + 10);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 手臂
        ctx.beginPath();
        ctx.moveTo(x, y - 5);
        ctx.lineTo(x + 15, y);
        ctx.moveTo(x, y - 5);
        ctx.lineTo(x - 15, y);
        ctx.stroke();
        
        // 腿部
        ctx.beginPath();
        ctx.moveTo(x, y + 10);
        ctx.lineTo(x + 10, y + 30);
        ctx.moveTo(x, y + 10);
        ctx.lineTo(x - 10, y + 30);
        ctx.stroke();
    }
    
    drawStickmanRunning(ctx) {
        const x = this.x + this.width / 2;
        const y = this.y + this.height / 2;
        const legOffset = 10 * Math.sin(this.frameX);
        
        // 头部
        ctx.beginPath();
        ctx.arc(x, y - 25, 10, 0, Math.PI * 2);
        ctx.fillStyle = '#000';
        ctx.fill();
        
        // 身体
        ctx.beginPath();
        ctx.moveTo(x, y - 15);
        ctx.lineTo(x, y + 10);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 手臂 - 摆动
        ctx.beginPath();
        ctx.moveTo(x, y - 5);
        ctx.lineTo(x + 15 * Math.cos(this.frameX), y + 5 * Math.sin(this.frameX));
        ctx.moveTo(x, y - 5);
        ctx.lineTo(x - 15 * Math.cos(this.frameX), y - 5 * Math.sin(this.frameX));
        ctx.stroke();
        
        // 腿部 - 跑步动画
        ctx.beginPath();
        ctx.moveTo(x, y + 10);
        ctx.lineTo(x + legOffset, y + 30);
        ctx.moveTo(x, y + 10);
        ctx.lineTo(x - legOffset, y + 30);
        ctx.stroke();
    }
    
    drawStickmanJumping(ctx) {
        const x = this.x + this.width / 2;
        const y = this.y + this.height / 2;
        
        // 头部
        ctx.beginPath();
        ctx.arc(x, y - 25, 10, 0, Math.PI * 2);
        ctx.fillStyle = '#000';
        ctx.fill();
        
        // 身体
        ctx.beginPath();
        ctx.moveTo(x, y - 15);
        ctx.lineTo(x, y + 10);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 手臂 - 举起
        ctx.beginPath();
        ctx.moveTo(x, y - 5);
        ctx.lineTo(x + 15, y - 10);
        ctx.moveTo(x, y - 5);
        ctx.lineTo(x - 15, y - 10);
        ctx.stroke();
        
        // 腿部 - 弯曲
        ctx.beginPath();
        ctx.moveTo(x, y + 10);
        ctx.lineTo(x + 15, y + 20);
        ctx.moveTo(x, y + 10);
        ctx.lineTo(x - 15, y + 20);
        ctx.stroke();
    }
    
    drawStickmanAttacking(ctx) {
        const x = this.x + this.width / 2;
        const y = this.y + this.height / 2;
        
        // 头部
        ctx.beginPath();
        ctx.arc(x, y - 25, 10, 0, Math.PI * 2);
        ctx.fillStyle = '#000';
        ctx.fill();
        
        // 身体 - 略微倾斜
        ctx.beginPath();
        ctx.moveTo(x, y - 15);
        ctx.lineTo(x - 5, y + 10);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 手臂 - 攻击姿势
        ctx.beginPath();
        ctx.moveTo(x, y - 5);
        ctx.lineTo(x + 25, y);
        ctx.moveTo(x, y - 5);
        ctx.lineTo(x - 10, y);
        ctx.stroke();
        
        // 武器/拳头
        ctx.beginPath();
        ctx.arc(x + 25, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#f00';
        ctx.fill();
        
        // 腿部
        ctx.beginPath();
        ctx.moveTo(x - 5, y + 10);
        ctx.lineTo(x + 5, y + 30);
        ctx.moveTo(x - 5, y + 10);
        ctx.lineTo(x - 15, y + 30);
        ctx.stroke();
    }
    
    drawStickmanSpecial(ctx) {
        const x = this.x + this.width / 2;
        const y = this.y + this.height / 2;
        
        // 光环效果
        ctx.beginPath();
        ctx.arc(x, y, 20 + this.frameX * 3, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(51, 153, 255, 0.5)';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // 头部
        ctx.beginPath();
        ctx.arc(x, y - 25, 10, 0, Math.PI * 2);
        ctx.fillStyle = '#000';
        ctx.fill();
        
        // 身体
        ctx.beginPath();
        ctx.moveTo(x, y - 15);
        ctx.lineTo(x, y + 10);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 手臂 - 特殊姿势
        ctx.beginPath();
        ctx.moveTo(x, y - 5);
        ctx.lineTo(x + 20, y - 20);
        ctx.moveTo(x, y - 5);
        ctx.lineTo(x - 20, y - 20);
        ctx.stroke();
        
        // 腿部
        ctx.beginPath();
        ctx.moveTo(x, y + 10);
        ctx.lineTo(x + 10, y + 30);
        ctx.moveTo(x, y + 10);
        ctx.lineTo(x - 10, y + 30);
        ctx.stroke();
        
        // 能量效果
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            const radius = 15 + this.frameX * 2;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(
                x + Math.cos(angle) * radius,
                y + Math.sin(angle) * radius
            );
            ctx.strokeStyle = 'rgba(51, 153, 255, 0.7)';
            ctx.stroke();
        }
    }
    
    drawStickmanHurt(ctx) {
        const x = this.x + this.width / 2;
        const y = this.y + this.height / 2;
        
        // 头部 - 略微倾斜
        ctx.beginPath();
        ctx.arc(x - 5, y - 20, 10, 0, Math.PI * 2);
        ctx.fillStyle = '#000';
        ctx.fill();
        
        // 身体 - 倾斜
        ctx.beginPath();
        ctx.moveTo(x - 5, y - 10);
        ctx.lineTo(x, y + 15);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 手臂 - 受伤姿势
        ctx.beginPath();
        ctx.moveTo(x - 5, y);
        ctx.lineTo(x - 20, y - 5);
        ctx.moveTo(x - 5, y);
        ctx.lineTo(x + 10, y + 5);
        ctx.stroke();
        
        // 腿部 - 受伤姿势
        ctx.beginPath();
        ctx.moveTo(x, y + 15);
        ctx.lineTo(x - 15, y + 25);
        ctx.moveTo(x, y + 15);
        ctx.lineTo(x + 10, y + 30);
        ctx.stroke();
    }
} 