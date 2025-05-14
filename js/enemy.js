export class Enemy {
    constructor(x, y, type, game) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.type = type;
        this.width = 40;
        this.height = 60;
        this.velocityX = 0;
        this.velocityY = 0;
        this.speed = 1;
        this.health = 100;
        this.damage = 10;
        this.contactDamage = 10;
        this.points = 100;
        this.isGrounded = false;
        this.direction = -1; // -1 左, 1 右
        this.detectionRange = 300;
        this.attackRange = 50;
        this.attackCooldown = 0;
        this.attackSpeed = 1000; // 毫秒
        this.patrolDistance = 100;
        this.startX = x;
        this.isPatrolling = true;
        this.weight = 0.5;
        
        // 敌人特性初始化
        this.initEnemyType();
        
        // 动画状态
        this.states = {
            IDLE: 'idle',
            WALKING: 'walking',
            ATTACKING: 'attacking',
            HURT: 'hurt'
        };
        this.currentState = this.states.IDLE;
        
        // 动画
        this.frameX = 0;
        this.frameY = 0;
        this.maxFrames = 5;
        this.frameTimer = 0;
        this.frameInterval = 150; // 毫秒
        
        // 弹跳引导变量
        this.jumpTimer = 0;
        this.jumpInterval = 2000; // 毫秒
    }
    
    initEnemyType() {
        switch(this.type) {
            case 'basic':
                // 基础敌人 - 左右巡逻
                this.health = 50;
                this.damage = 10;
                this.contactDamage = 10;
                this.points = 50;
                this.color = '#cc0000';
                this.speed = 1;
                this.detectionRange = 200;
                break;
                
            case 'robot':
                // 机器人敌人 - 更强壮，会冲刺攻击
                this.health = 80;
                this.damage = 15;
                this.contactDamage = 15;
                this.points = 100;
                this.color = '#666666';
                this.speed = 1.5;
                this.detectionRange = 250;
                this.attackRange = 150;
                this.dashSpeed = 5;
                this.isDashing = false;
                this.dashCooldown = 0;
                this.dashDuration = 0;
                break;
                
            case 'turret':
                // 炮塔 - 静止不动，但会远程攻击
                this.health = 60;
                this.damage = 20;
                this.contactDamage = 5;
                this.points = 75;
                this.color = '#0099cc';
                this.speed = 0;
                this.isPatrolling = false;
                this.detectionRange = 350;
                this.attackRange = 300;
                this.projectiles = [];
                break;
                
            case 'boss':
                // Boss敌人 - 强大且有多种攻击模式
                this.health = 300;
                this.damage = 25;
                this.contactDamage = 25;
                this.points = 500;
                this.color = '#990099';
                this.speed = 2;
                this.width = 80;
                this.height = 100;
                this.detectionRange = 400;
                this.attackRange = 200;
                this.attackPatterns = ['melee', 'ranged', 'dash', 'summon'];
                this.currentAttackPattern = 0;
                this.minionCount = 0;
                this.maxMinions = 3;
                break;
        }
    }
    
    update(deltaTime) {
        // 处理重力
        if (!this.isGrounded) {
            this.velocityY += this.weight;
        }
        
        // 检测玩家
        const player = this.game.player;
        const distanceToPlayer = this.getDistanceToPlayer(player);
        
        // 更新攻击冷却
        if (this.attackCooldown > 0) {
            this.attackCooldown -= deltaTime;
        }
        
        // 如果是机器人类型敌人，处理冲刺状态
        if (this.type === 'robot') {
            if (this.dashCooldown > 0) {
                this.dashCooldown -= deltaTime;
            }
            if (this.dashDuration > 0) {
                this.dashDuration -= deltaTime;
                if (this.dashDuration <= 0) {
                    this.isDashing = false;
                    this.velocityX = 0;
                }
            }
        }
        
        // 根据敌人类型和玩家距离决定行为
        if (distanceToPlayer <= this.detectionRange) {
            // 检测到玩家
            this.isPatrolling = false;
            
            if (this.type !== 'turret') {
                // 根据玩家位置设置方向
                this.direction = player.x < this.x ? -1 : 1;
                
                // 朝向玩家移动（如果不是炮塔类型）
                if (!this.isDashing && this.type !== 'turret') {
                    this.velocityX = this.direction * this.speed;
                }
            }
            
            // 在攻击范围内攻击玩家
            if (distanceToPlayer <= this.attackRange && this.attackCooldown <= 0) {
                this.attack(player);
            }
        } else {
            // 没有检测到玩家，进行巡逻
            if (this.isPatrolling && this.type !== 'turret') {
                this.patrol();
            } else {
                this.velocityX = 0;
                this.currentState = this.states.IDLE;
            }
        }
        
        // 移动敌人
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // 简单AI - 遇到边缘时转向
        this.handleEdgeDetection();
        
        // 碰撞检测
        this.checkCollisions();
        
        // 更新投射物（如果有）
        if (this.projectiles) {
            this.updateProjectiles();
        }
        
        // 更新动画
        this.updateAnimation(deltaTime);
        
        // 更新敌人状态
        this.updateState();
    }
    
    handleEdgeDetection() {
        // 检查前方是否有平台
        const frontX = this.x + (this.direction * this.width / 2);
        const frontY = this.y + this.height + 5;
        
        let hasPlatformAhead = false;
        
        for (const platform of this.game.level.platforms) {
            if (frontX >= platform.x && 
                frontX <= platform.x + platform.width && 
                frontY >= platform.y && 
                frontY <= platform.y + 10) {
                hasPlatformAhead = true;
                break;
            }
        }
        
        // 如果前方没有平台，改变方向
        if (!hasPlatformAhead && this.isGrounded) {
            this.direction *= -1;
        }
        
        // 检查是否碰到墙壁
        if (this.x <= 0) {
            this.direction = 1;
        } else if (this.x + this.width >= this.game.gameWidth) {
            this.direction = -1;
        }
    }
    
    patrol() {
        // 简单的左右巡逻
        if (Math.abs(this.x - this.startX) > this.patrolDistance) {
            this.direction *= -1;
        }
        
        this.velocityX = this.direction * this.speed * 0.5;
        this.currentState = this.states.WALKING;
    }
    
    attack(player) {
        this.attackCooldown = this.attackSpeed;
        this.currentState = this.states.ATTACKING;
        
        switch(this.type) {
            case 'basic':
                // 基础攻击 - 简单的冲刺
                this.velocityX = this.direction * this.speed * 2;
                setTimeout(() => {
                    this.velocityX = this.direction * this.speed;
                }, 300);
                break;
                
            case 'robot':
                // 机器人攻击 - 快速冲刺
                if (this.dashCooldown <= 0) {
                    this.isDashing = true;
                    this.velocityX = this.direction * this.dashSpeed;
                    this.dashDuration = 300;
                    this.dashCooldown = 2000;
                    this.game.soundManager.playSound('robot-dash');
                }
                break;
                
            case 'turret':
                // 炮塔攻击 - 发射子弹
                this.shootProjectile(player);
                break;
                
            case 'boss':
                // Boss攻击 - 多种攻击模式
                this.bossPatterAttack(player);
                break;
        }
        
        // 播放攻击音效
        if (this.type !== 'turret') { // 炮塔在射击时会播放单独的音效
            this.game.soundManager.playSound('enemy-attack');
        }
    }
    
    shootProjectile(player) {
        // 计算方向向量
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const directionX = dx / distance;
        const directionY = dy / distance;
        
        // 创建投射物
        const projectile = {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2,
            radius: 5,
            speed: 5,
            directionX,
            directionY,
            damage: this.damage,
            color: '#00ccff'
        };
        
        this.projectiles.push(projectile);
        this.game.soundManager.playSound('shoot');
    }
    
    updateProjectiles() {
        // 更新所有投射物位置
        for (let i = 0; i < this.projectiles.length; i++) {
            const p = this.projectiles[i];
            
            // 移动投射物
            p.x += p.directionX * p.speed;
            p.y += p.directionY * p.speed;
            
            // 检查是否击中玩家
            if (this.checkProjectileHit(p, this.game.player)) {
                this.game.player.takeDamage(p.damage);
                this.projectiles.splice(i, 1);
                i--;
                this.game.createParticles(
                    this.game.player.x + this.game.player.width / 2,
                    this.game.player.y + this.game.player.height / 2,
                    10,
                    p.color
                );
                continue;
            }
            
            // 检查是否碰到平台
            let hitPlatform = false;
            for (const platform of this.game.level.platforms) {
                if (p.x > platform.x && 
                    p.x < platform.x + platform.width && 
                    p.y > platform.y && 
                    p.y < platform.y + platform.height) {
                    hitPlatform = true;
                    break;
                }
            }
            
            if (hitPlatform) {
                this.projectiles.splice(i, 1);
                i--;
                this.game.createParticles(p.x, p.y, 5, p.color);
                continue;
            }
            
            // 检查是否超出屏幕
            if (p.x < 0 || p.x > this.game.gameWidth || 
                p.y < 0 || p.y > this.game.gameHeight) {
                this.projectiles.splice(i, 1);
                i--;
            }
        }
    }
    
    checkProjectileHit(projectile, player) {
        // 检查投射物是否击中玩家
        return (
            projectile.x > player.x && 
            projectile.x < player.x + player.width && 
            projectile.y > player.y && 
            projectile.y < player.y + player.height
        );
    }
    
    bossPatterAttack(player) {
        // Boss使用多种攻击模式
        const pattern = this.attackPatterns[this.currentAttackPattern];
        
        switch(pattern) {
            case 'melee':
                // 近战重击
                this.velocityX = this.direction * this.speed * 3;
                setTimeout(() => {
                    this.velocityX = this.direction * this.speed;
                }, 500);
                break;
                
            case 'ranged':
                // 连发射击
                for (let i = 0; i < 3; i++) {
                    setTimeout(() => {
                        if (this.projectiles) {
                            this.shootProjectile(player);
                        }
                    }, i * 200);
                }
                break;
                
            case 'dash':
                // 快速冲刺后跳跃砸地
                this.velocityX = this.direction * this.speed * 4;
                setTimeout(() => {
                    this.velocityY = -10; // 跳跃
                    setTimeout(() => {
                        // 砸地创造冲击波
                        this.game.createParticles(this.x, this.y + this.height, 20, '#990099');
                        this.game.ui.shake();
                    }, 500);
                }, 300);
                break;
                
            case 'summon':
                // 召唤小兵
                if (this.minionCount < this.maxMinions) {
                    const minion = this.game.createEnemy(
                        this.x + this.direction * 50,
                        this.y,
                        'basic',
                        this.game
                    );
                    this.minionCount++;
                    
                    // 当小兵死亡时减少计数
                    const originalTakeDamage = minion.takeDamage;
                    minion.takeDamage = (amount) => {
                        const result = originalTakeDamage.call(minion, amount);
                        if (minion.health <= 0) {
                            this.minionCount--;
                        }
                        return result;
                    };
                }
                break;
        }
        
        // 切换到下一种攻击模式
        this.currentAttackPattern = (this.currentAttackPattern + 1) % this.attackPatterns.length;
    }
    
    getDistanceToPlayer(player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    checkCollisions() {
        // 与平台的碰撞
        this.isGrounded = false;
        
        this.game.level.platforms.forEach(platform => {
            if (this.x < platform.x + platform.width &&
                this.x + this.width > platform.x &&
                this.y < platform.y + platform.height &&
                this.y + this.height > platform.y) {
                
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
                    this.velocityX = 0;
                    this.direction = -1;
                }
                // 从右侧碰撞
                else if (this.velocityX < 0 && 
                        this.x >= platform.x + platform.width) {
                    this.x = platform.x + platform.width;
                    this.velocityX = 0;
                    this.direction = 1;
                }
            }
        });
    }
    
    updateState() {
        // 更新当前状态
        if (this.currentState === this.states.ATTACKING) {
            // 保持攻击状态直到动画结束
            if (this.frameX >= this.maxFrames - 1) {
                this.currentState = this.states.IDLE;
            }
        } else if (Math.abs(this.velocityX) > 0.1) {
            this.currentState = this.states.WALKING;
        } else {
            this.currentState = this.states.IDLE;
        }
    }
    
    updateAnimation(deltaTime) {
        // 更新帧率
        this.frameTimer += deltaTime;
        
        if (this.frameTimer > this.frameInterval) {
            this.frameTimer = 0;
            
            if (this.frameX < this.maxFrames - 1) {
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
            case this.states.WALKING:
                this.frameY = 1;
                break;
            case this.states.ATTACKING:
                this.frameY = 2;
                break;
            case this.states.HURT:
                this.frameY = 3;
                break;
            default:
                this.frameY = 0;
        }
    }
    
    takeDamage(amount) {
        this.health -= amount;
        
        // 击退效果
        const knockbackForce = 3;
        this.velocityX = (this.game.player.x > this.x ? -1 : 1) * knockbackForce;
        this.velocityY = -knockbackForce / 2;
        
        // 受伤状态
        this.currentState = this.states.HURT;
        
        // 播放受伤音效
        this.game.soundManager.playSound('enemy-hurt');
        
        return this.health <= 0;
    }
    
    draw(ctx) {
        // 绘制敌人
        ctx.save();
        
        // 根据方向翻转
        if (this.direction === 1) {
            ctx.translate(this.x + this.width, 0);
            ctx.scale(-1, 1);
            ctx.translate(-this.x, 0);
        }
        
        // 根据敌人类型绘制不同外观
        switch(this.type) {
            case 'basic':
                this.drawBasicEnemy(ctx);
                break;
            case 'robot':
                this.drawRobotEnemy(ctx);
                break;
            case 'turret':
                this.drawTurretEnemy(ctx);
                break;
            case 'boss':
                this.drawBossEnemy(ctx);
                break;
        }
        
        ctx.restore();
        
        // 绘制投射物（如果有）
        if (this.projectiles) {
            this.drawProjectiles(ctx);
        }
        
        // 调试 - 显示碰撞箱
        if (false) { // 设为true启用调试
            ctx.strokeStyle = 'red';
            ctx.strokeRect(this.x, this.y, this.width, this.height);
            
            // 显示检测范围
            ctx.strokeStyle = 'yellow';
            ctx.beginPath();
            ctx.arc(
                this.x + this.width / 2, 
                this.y + this.height / 2, 
                this.detectionRange, 
                0, 
                Math.PI * 2
            );
            ctx.stroke();
            
            // 显示攻击范围
            ctx.strokeStyle = 'orange';
            ctx.beginPath();
            ctx.arc(
                this.x + this.width / 2, 
                this.y + this.height / 2, 
                this.attackRange, 
                0, 
                Math.PI * 2
            );
            ctx.stroke();
        }
    }
    
    drawBasicEnemy(ctx) {
        // 绘制基础敌人
        const x = this.x + this.width / 2;
        const y = this.y + this.height / 2;
        
        // 身体
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 头部
        ctx.beginPath();
        ctx.arc(x, y - 20, 10, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        
        // 眼睛
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(x - 3, y - 20, 3, 0, Math.PI * 2);
        ctx.arc(x + 3, y - 20, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(x - 3, y - 20, 1.5, 0, Math.PI * 2);
        ctx.arc(x + 3, y - 20, 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        // 手臂
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 4;
        ctx.beginPath();
        
        if (this.currentState === this.states.ATTACKING) {
            // 攻击姿势
            ctx.moveTo(x - 10, y - 10);
            ctx.lineTo(x - 25, y);
            ctx.moveTo(x + 10, y - 10);
            ctx.lineTo(x + 25, y - 5);
        } else if (this.currentState === this.states.WALKING) {
            // 走路姿势
            const armSwing = Math.sin(this.frameX * 0.5) * 5;
            ctx.moveTo(x - 10, y - 10);
            ctx.lineTo(x - 20, y + armSwing);
            ctx.moveTo(x + 10, y - 10);
            ctx.lineTo(x + 20, y - armSwing);
        } else {
            // 站立姿势
            ctx.moveTo(x - 10, y - 10);
            ctx.lineTo(x - 20, y);
            ctx.moveTo(x + 10, y - 10);
            ctx.lineTo(x + 20, y);
        }
        ctx.stroke();
        
        // 腿部
        ctx.beginPath();
        if (this.currentState === this.states.WALKING) {
            // 走路姿势 - 腿部摆动
            const legSwing = Math.sin(this.frameX * 0.5) * 5;
            ctx.moveTo(x - 10, y + 10);
            ctx.lineTo(x - 10, y + 30 + legSwing);
            ctx.moveTo(x + 10, y + 10);
            ctx.lineTo(x + 10, y + 30 - legSwing);
        } else {
            // 站立姿势
            ctx.moveTo(x - 10, y + 10);
            ctx.lineTo(x - 10, y + 30);
            ctx.moveTo(x + 10, y + 10);
            ctx.lineTo(x + 10, y + 30);
        }
        ctx.stroke();
    }
    
    drawRobotEnemy(ctx) {
        // 绘制机器人敌人
        const x = this.x + this.width / 2;
        const y = this.y + this.height / 2;
        
        // 机器人身体
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 机器人头部
        ctx.fillStyle = '#555';
        ctx.fillRect(x - 15, y - 25, 30, 20);
        
        // 眼睛/传感器
        ctx.fillStyle = this.isDashing ? '#ff0000' : '#00ffff';
        ctx.fillRect(x - 10, y - 20, 5, 5);
        ctx.fillRect(x + 5, y - 20, 5, 5);
        
        // 天线
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y - 25);
        ctx.lineTo(x, y - 35);
        ctx.stroke();
        
        // 机械臂
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 4;
        ctx.beginPath();
        
        if (this.currentState === this.states.ATTACKING) {
            // 攻击姿势 - 伸出机械臂
            ctx.moveTo(x - 10, y - 5);
            ctx.lineTo(x - 25, y + 5);
            ctx.moveTo(x + 10, y - 5);
            ctx.lineTo(x + 25, y + 5);
        } else if (this.currentState === this.states.WALKING) {
            // 走路姿势 - 机械臂摆动
            const armSwing = Math.sin(this.frameX * 0.5) * 5;
            ctx.moveTo(x - 10, y - 5);
            ctx.lineTo(x - 20, y + armSwing);
            ctx.moveTo(x + 10, y - 5);
            ctx.lineTo(x + 20, y - armSwing);
        } else {
            // 站立姿势
            ctx.moveTo(x - 10, y - 5);
            ctx.lineTo(x - 20, y);
            ctx.moveTo(x + 10, y - 5);
            ctx.lineTo(x + 20, y);
        }
        ctx.stroke();
        
        // 腿部
        ctx.beginPath();
        if (this.currentState === this.states.WALKING) {
            // 走路姿势 - 机械腿运动
            const legSwing = Math.sin(this.frameX * 0.5) * 5;
            ctx.moveTo(x - 10, y + 10);
            ctx.lineTo(x - 10, y + 30 + legSwing);
            ctx.moveTo(x + 10, y + 10);
            ctx.lineTo(x + 10, y + 30 - legSwing);
        } else {
            // 站立姿势
            ctx.moveTo(x - 10, y + 10);
            ctx.lineTo(x - 10, y + 30);
            ctx.moveTo(x + 10, y + 10);
            ctx.lineTo(x + 10, y + 30);
        }
        ctx.stroke();
        
        // 冲刺效果
        if (this.isDashing) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
            ctx.fillRect(this.x - 20, this.y, 20, this.height);
        }
    }
    
    drawTurretEnemy(ctx) {
        // 绘制炮塔敌人
        const x = this.x + this.width / 2;
        const y = this.y + this.height / 2;
        
        // 炮塔基座
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, y, this.width, this.height / 2);
        
        // 炮塔头部
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fillStyle = '#0077aa';
        ctx.fill();
        
        // 炮管
        ctx.strokeStyle = '#005588';
        ctx.lineWidth = 8;
        
        // 炮管朝向玩家
        const player = this.game.player;
        const dx = player.x - x;
        const dy = player.y - y;
        const angle = Math.atan2(dy, dx);
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(angle) * 25, y + Math.sin(angle) * 25);
        ctx.stroke();
        
        // 炮塔细节
        ctx.fillStyle = this.attackCooldown > 0 ? '#ff3333' : '#33ff33';
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawBossEnemy(ctx) {
        // 绘制Boss敌人
        const x = this.x + this.width / 2;
        const y = this.y + this.height / 2;
        
        // Boss身体
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Boss头部
        ctx.beginPath();
        ctx.arc(x, y - 30, 20, 0, Math.PI * 2);
        ctx.fillStyle = '#770077';
        ctx.fill();
        
        // Boss眼睛
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(x - 8, y - 30, 5, 0, Math.PI * 2);
        ctx.arc(x + 8, y - 30, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Boss角
        ctx.strokeStyle = '#550055';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(x - 10, y - 45);
        ctx.lineTo(x - 20, y - 60);
        ctx.moveTo(x + 10, y - 45);
        ctx.lineTo(x + 20, y - 60);
        ctx.stroke();
        
        // Boss手臂
        ctx.lineWidth = 8;
        ctx.beginPath();
        
        if (this.currentState === this.states.ATTACKING) {
            // 攻击姿势 - 取决于当前攻击模式
            const pattern = this.attackPatterns[this.currentAttackPattern];
            if (pattern === 'melee') {
                // 近战攻击姿势
                ctx.moveTo(x - 25, y - 10);
                ctx.lineTo(x - 50, y);
                ctx.moveTo(x + 25, y - 10);
                ctx.lineTo(x + 50, y);
            } else if (pattern === 'ranged') {
                // 远程攻击姿势
                ctx.moveTo(x - 25, y - 10);
                ctx.lineTo(x - 30, y - 20);
                ctx.moveTo(x + 25, y - 10);
                ctx.lineTo(x + 40, y - 15);
            } else if (pattern === 'summon') {
                // 召唤姿势
                ctx.moveTo(x - 25, y - 10);
                ctx.lineTo(x - 30, y + 20);
                ctx.moveTo(x + 25, y - 10);
                ctx.lineTo(x + 30, y + 20);
            }
        } else if (this.currentState === this.states.WALKING) {
            // 走路姿势
            const armSwing = Math.sin(this.frameX * 0.5) * 10;
            ctx.moveTo(x - 25, y - 10);
            ctx.lineTo(x - 40, y + armSwing);
            ctx.moveTo(x + 25, y - 10);
            ctx.lineTo(x + 40, y - armSwing);
        } else {
            // 站立姿势
            ctx.moveTo(x - 25, y - 10);
            ctx.lineTo(x - 40, y);
            ctx.moveTo(x + 25, y - 10);
            ctx.lineTo(x + 40, y);
        }
        ctx.stroke();
        
        // Boss腿部
        ctx.beginPath();
        if (this.currentState === this.states.WALKING) {
            // 走路姿势
            const legSwing = Math.sin(this.frameX * 0.5) * 10;
            ctx.moveTo(x - 20, y + 30);
            ctx.lineTo(x - 20, y + 50 + legSwing);
            ctx.moveTo(x + 20, y + 30);
            ctx.lineTo(x + 20, y + 50 - legSwing);
        } else {
            // 站立姿势
            ctx.moveTo(x - 20, y + 30);
            ctx.lineTo(x - 20, y + 50);
            ctx.moveTo(x + 20, y + 30);
            ctx.lineTo(x + 20, y + 50);
        }
        ctx.stroke();
        
        // Boss能量光环
        ctx.strokeStyle = 'rgba(153, 0, 153, 0.5)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, 40 + Math.sin(Date.now() / 200) * 5, 0, Math.PI * 2);
        ctx.stroke();
        
        // 生命值显示
        const healthPercent = this.health / 300;
        const barWidth = this.width;
        const barHeight = 8;
        
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x, this.y - 15, barWidth, barHeight);
        ctx.fillStyle = '#ff0066';
        ctx.fillRect(this.x, this.y - 15, barWidth * healthPercent, barHeight);
    }
    
    drawProjectiles(ctx) {
        // 绘制所有投射物
        ctx.fillStyle = this.type === 'boss' ? '#ff00ff' : '#00ccff';
        
        for (const p of this.projectiles) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // 添加拖尾效果
            ctx.fillStyle = 'rgba(0, 204, 255, 0.3)';
            ctx.beginPath();
            ctx.arc(p.x - p.directionX * 5, p.y - p.directionY * 5, p.radius * 1.5, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = p.color;
        }
    }
} 