import { Platform } from './platform.js';
import { BackgroundLayer } from './background.js';

export class Level {
    constructor(levelNumber, game) {
        this.game = game;
        this.levelNumber = levelNumber;
        this.width = game.gameWidth;
        this.height = game.gameHeight;
        this.platforms = [];
        this.backgrounds = [];
        this.enemies = []; // 存储敌人
        this.collectibles = []; // 存储收集物
        this.levelData = null;
        this.gravity = 0.5;
        
        // 优化的关卡数据，调整平台位置和尺寸，创建更有趣的关卡
        this.levels = [
            // 关卡1 - 基础训练
            {
                name: "基础训练",
                background: {
                    color: "#87CEEB",
                    layers: [
                        { src: "mountains", speedModifier: 0.2 },
                        { src: "trees", speedModifier: 0.4 }
                    ]
                },
                platforms: [
                    // 左侧地面
                    { x: 0, y: 500, width: 200, height: 100, type: "grass" },
                    
                    // 中间跳跃平台
                    { x: 250, y: 450, width: 120, height: 20, type: "grass" },
                    { x: 420, y: 400, width: 100, height: 20, type: "grass" },
                    { x: 570, y: 350, width: 80, height: 20, type: "grass" },
                    
                    // 高处平台
                    { x: 700, y: 280, width: 100, height: 20, type: "grass" },
                    { x: 500, y: 200, width: 120, height: 20, type: "grass" },
                    
                    // 右侧地面
                    { x: 750, y: 500, width: 200, height: 100, type: "grass" }
                ],
                enemies: [
                    { x: 300, y: 400, type: "basic" },
                    { x: 600, y: 300, type: "basic" }
                ],
                collectibles: [
                    { x: 300, y: 400, type: "coin" },
                    { x: 450, y: 350, type: "coin" },
                    { x: 600, y: 300, type: "energy" },
                    { x: 750, y: 230, type: "health" }
                ]
            },
            
            // 关卡2 - 工厂危机
            {
                name: "工厂危机",
                background: {
                    color: "#555",
                    layers: [
                        { src: "factory", speedModifier: 0.2 },
                        { src: "smoke", speedModifier: 0.3 }
                    ]
                },
                platforms: [
                    // 左侧地面和升降梯
                    { x: 0, y: 500, width: 200, height: 100, type: "metal" },
                    { x: 250, y: 450, width: 100, height: 20, type: "metal" },
                    
                    // 中间跳跃挑战
                    { x: 400, y: 400, width: 80, height: 20, type: "metal" },
                    { x: 520, y: 350, width: 80, height: 20, type: "metal" },
                    { x: 640, y: 300, width: 80, height: 20, type: "metal" },
                    
                    // 高处平台
                    { x: 400, y: 250, width: 120, height: 20, type: "metal" },
                    { x: 200, y: 200, width: 120, height: 20, type: "metal" },
                    
                    // 右侧地面
                    { x: 700, y: 450, width: 200, height: 150, type: "metal" }
                ],
                enemies: [
                    { x: 300, y: 400, type: "robot" },
                    { x: 600, y: 250, type: "robot" },
                    { x: 750, y: 400, type: "turret" }
                ],
                collectibles: [
                    { x: 300, y: 400, type: "coin" },
                    { x: 450, y: 350, type: "coin" },
                    { x: 600, y: 200, type: "energy" },
                    { x: 500, y: 500, type: "health" }
                ]
            },
            
            // 关卡3 - 最终挑战
            {
                name: "最终挑战",
                background: {
                    color: "#300",
                    layers: [
                        { src: "lava", speedModifier: 0.1 },
                        { src: "castle", speedModifier: 0.3 }
                    ]
                },
                platforms: [
                    // 左侧起点
                    { x: 0, y: 500, width: 150, height: 100, type: "stone" },
                    
                    // 跨越熔岩的平台
                    { x: 200, y: 500, width: 80, height: 20, type: "stone" },
                    { x: 350, y: 450, width: 80, height: 20, type: "stone" },
                    { x: 480, y: 400, width: 80, height: 20, type: "stone" },
                    
                    // 升降平台
                    { x: 620, y: 350, width: 80, height: 20, type: "stone" },
                    
                    // 顶部平台
                    { x: 500, y: 280, width: 100, height: 20, type: "stone" },
                    { x: 350, y: 220, width: 100, height: 20, type: "stone" },
                    { x: 200, y: 180, width: 100, height: 20, type: "stone" },
                    
                    // BOSS平台
                    { x: 700, y: 350, width: 200, height: 250, type: "stone" }
                ],
                enemies: [
                    { x: 200, y: 450, type: "basic" },
                    { x: 350, y: 400, type: "robot" },
                    { x: 500, y: 350, type: "robot" },
                    { x: 620, y: 300, type: "turret" },
                    { x: 750, y: 300, type: "boss" }
                ],
                collectibles: [
                    { x: 280, y: 450, type: "coin" },
                    { x: 430, y: 350, type: "coin" },
                    { x: 580, y: 200, type: "energy" },
                    { x: 400, y: 500, type: "health" },
                    { x: 750, y: 300, type: "star" }
                ]
            }
        ];

        // 初始化关卡
        this.init();
        
        console.log(`关卡 ${levelNumber} 已创建`);
    }
    
    init() {
        // 清空当前关卡数据
        this.platforms = [];
        this.backgrounds = [];
        
        // 同步加载关卡数据、背景和平台
        this.loadLevelData();
        
        // 确保levelData已加载，否则后续创建会失败
        if (!this.levelData) {
            console.error("关卡数据 (this.levelData) 未能成功加载！");
            // 可以考虑加载一个默认的空关卡或显示错误
            this.levelData = { name: "Error Level", background: { color: "#ff0000" }, platforms: [], enemies: [], collectibles: [] };
        }
        
        this.createBackground();
        this.createPlatforms();
        
        // 同步创建敌人和收集物
        this.createEnemies();
        this.createCollectibles();
        
        console.log("关卡同步初始化完成。平台数量:", this.platforms.length);
    }
    
    loadLevelData() {
        // 获取当前关卡数据
        this.levelData = this.levels[this.levelNumber - 1] || this.levels[0];
    }
    
    createBackground() {
        // 使用简单的背景颜色
        this.backgroundColor = this.levelData?.background?.color || "#87CEEB";
        
        // 创建视差背景层 - 使用更高效的方式
        this.backgrounds = [
            new BackgroundLayer(0, 0, this.width, this.height, this.backgroundColor, 0),
            new BackgroundLayer(0, this.game.groundLevel - 50, this.width, this.height - this.game.groundLevel + 50, "#5a3921", 0.2)
        ];
    }
    
    createPlatforms() {
        // 创建平台对象池以避免频繁创建和销毁
        if (!this.platformPool) {
            this.platformPool = [];
        }
        
        // 获取关卡定义的平台数据
        const platformsData = this.levelData.platforms;
        
        // 计算需要创建的平台数量
        const count = platformsData.length;
        
        // 如果对象池大小不足，则扩展
        while (this.platformPool.length < count) {
            this.platformPool.push(new Platform(0, 0, 0, 0, "normal"));
        }
        
        const originalFixedGroundY = 500; // 假设原始关卡设计基于地面y=500

        // 清空当前平台列表
        this.platforms = [];

        // 重用或创建平台对象
        for (let i = 0; i < count; i++) {
            const data = platformsData[i];
            const platform = this.platformPool[i];
            
            // 重置平台属性
            platform.x = data.x;
            // 调整y坐标以适应动态的groundLevel
            // 平台原始y值 - 原始地面y值 + 新的地面y值
            platform.y = data.y - originalFixedGroundY + this.game.groundLevel;
            platform.width = data.width;
            platform.height = data.height;
            platform.type = data.type || "normal";
            
            // 添加到活动平台列表
            this.platforms.push(platform);
            
            // 为特定平台添加特殊属性（如移动或单向穿过）
            // 关卡1 - 让特定平台移动
            if (this.levelNumber === 1) {
                // 让第三个平台水平移动
                if (i === 2) {
                    platform.setMoving(1, 100, 'x');
                }
                // 让高处平台可以从下方穿过
                if (i === 4 || i === 5) {
                    platform.setPassThrough();
                }
            }
            // 关卡2 - 更多移动平台
            else if (this.levelNumber === 2) {
                // 让几个平台垂直移动
                if (i === 1) {
                    platform.setMoving(0.8, 70, 'y');
                }
                if (i === 3) {
                    platform.setMoving(1.2, 50, 'x');
                }
                // 让高处平台可以从下方穿过
                if (i === 5 || i === 6) {
                    platform.setPassThrough();
                }
            }
            // 关卡3 - 复杂的平台移动
            else if (this.levelNumber === 3) {
                // 熔岩上的几个平台添加移动
                if (i === 1) {
                    platform.setMoving(0.5, 50, 'x');
                }
                if (i === 3) {
                    platform.setMoving(0.8, 60, 'y');
                }
                // 顶部平台可从下方穿过
                if (i >= 5 && i <= 7) {
                    platform.setPassThrough();
                }
            }
        }
        
        console.log(`创建了 ${this.platforms.length} 个平台`);
    }
    
    createEnemies() {
        // 清空当前敌人列表
        this.enemies = [];
        
        // 批量创建敌人以提高性能
        const enemiesData = this.levelData.enemies || [];
        
        // 使用一个循环批量创建所有敌人
        for (let i = 0; i < enemiesData.length; i++) {
            const data = enemiesData[i];
            
            // 调整敌人的Y坐标，与平台调整逻辑一致
            const originalFixedGroundY = 500;
            const adjustedY = data.y - originalFixedGroundY + this.game.groundLevel;
            
            // 创建敌人并添加到数组
            const enemy = this.game.createEnemy(data.x, adjustedY, data.type);
            if (enemy) {
                this.enemies.push(enemy);
            }
        }
        
        console.log(`创建了 ${this.enemies.length} 个敌人`);
    }
    
    createCollectibles() {
        // 清空当前收集物列表
        this.collectibles = [];
        
        // 批量创建收集物以提高性能
        const collectiblesData = this.levelData.collectibles || [];
        
        // 使用一个循环批量创建所有收集物
        for (let i = 0; i < collectiblesData.length; i++) {
            const data = collectiblesData[i];
            
            // 调整收集物的Y坐标，与平台调整逻辑一致
            const originalFixedGroundY = 500;
            const adjustedY = data.y - originalFixedGroundY + this.game.groundLevel;
            
            // 创建收集物并添加到数组
            const collectible = this.game.createCollectible(data.x, adjustedY, data.type);
            if (collectible) {
                this.collectibles.push(collectible);
            }
        }
        
        console.log(`创建了 ${this.collectibles.length} 个收集物`);
    }
    
    update(deltaTime) {
        // 更新背景
        for (let i = 0; i < this.backgrounds.length; i++) {
            this.backgrounds[i].update(this.game.player?.velocityX || 0);
        }
        
        // 更新平台
        for (let i = 0; i < this.platforms.length; i++) {
            if (this.platforms[i].isMoving) {
                this.platforms[i].update();
            }
        }
    }
    
    draw(ctx) {
        // 清除背景
        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(0, 0, this.width, this.height);
        
        // 绘制背景层
        for (let i = 0; i < this.backgrounds.length; i++) {
            this.backgrounds[i].draw(ctx);
        }
        
        // 绘制平台
        for (let i = 0; i < this.platforms.length; i++) {
            this.platforms[i].draw(ctx);
        }
        
        // 绘制收集物
        for (let i = 0; i < this.collectibles.length; i++) {
            if (this.collectibles[i].draw) {
                this.collectibles[i].draw(ctx);
            }
        }
        
        // 绘制敌人
        for (let i = 0; i < this.enemies.length; i++) {
            if (this.enemies[i].draw) {
                this.enemies[i].draw(ctx);
            }
        }

        // 在关卡1绘制一些云
        if (this.levelNumber === 1) {
            // 绘制云朵 - 根据屏幕大小调整位置
            const cloudHeight1 = this.height * 0.2;
            const cloudHeight2 = this.height * 0.3;
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.beginPath();
            ctx.arc(this.width * 0.25, cloudHeight1, 30, 0, Math.PI * 2);
            ctx.arc(this.width * 0.25 + 30, cloudHeight1 - 10, 25, 0, Math.PI * 2);
            ctx.arc(this.width * 0.25 + 60, cloudHeight1, 30, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(this.width * 0.6, cloudHeight2, 25, 0, Math.PI * 2);
            ctx.arc(this.width * 0.6 + 30, cloudHeight2 - 10, 20, 0, Math.PI * 2);
            ctx.arc(this.width * 0.6 + 60, cloudHeight2, 25, 0, Math.PI * 2);
            ctx.fill();
        }
    }
} 