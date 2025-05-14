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
        this.levelData = null;
        this.gravity = 0.5;
        
        // 预定义关卡数据，避免每次重新创建
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
                    { x: 0, y: 500, width: 200, height: 100, type: "grass" },
                    { x: 250, y: 500, width: 200, height: 100, type: "grass" },
                    { x: 500, y: 450, width: 200, height: 150, type: "grass" },
                    { x: 750, y: 500, width: 200, height: 100, type: "grass" }
                ],
                enemies: [
                    { x: 300, y: 450, type: "basic" },
                    { x: 600, y: 400, type: "basic" }
                ],
                collectibles: [
                    { x: 100, y: 450, type: "coin" },
                    { x: 400, y: 450, type: "coin" },
                    { x: 550, y: 400, type: "energy" },
                    { x: 700, y: 450, type: "health" }
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
                    { x: 0, y: 500, width: 200, height: 100, type: "metal" },
                    { x: 250, y: 450, width: 100, height: 20, type: "metal" },
                    { x: 400, y: 400, width: 100, height: 20, type: "metal" },
                    { x: 550, y: 350, width: 100, height: 20, type: "metal" },
                    { x: 650, y: 450, width: 200, height: 150, type: "metal" }
                ],
                enemies: [
                    { x: 300, y: 400, type: "robot" },
                    { x: 550, y: 300, type: "robot" },
                    { x: 700, y: 400, type: "turret" }
                ],
                collectibles: [
                    { x: 280, y: 400, type: "coin" },
                    { x: 430, y: 350, type: "coin" },
                    { x: 580, y: 300, type: "energy" },
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
                    { x: 0, y: 500, width: 150, height: 100, type: "stone" },
                    { x: 200, y: 550, width: 100, height: 50, type: "stone" },
                    { x: 350, y: 450, width: 100, height: 20, type: "stone" },
                    { x: 500, y: 400, width: 100, height: 20, type: "stone" },
                    { x: 650, y: 350, width: 100, height: 20, type: "stone" },
                    { x: 800, y: 500, width: 100, height: 100, type: "stone" }
                ],
                enemies: [
                    { x: 200, y: 500, type: "basic" },
                    { x: 350, y: 400, type: "robot" },
                    { x: 500, y: 350, type: "robot" },
                    { x: 650, y: 300, type: "turret" },
                    { x: 750, y: 450, type: "boss" }
                ],
                collectibles: [
                    { x: 280, y: 500, type: "coin" },
                    { x: 430, y: 400, type: "coin" },
                    { x: 580, y: 350, type: "energy" },
                    { x: 400, y: 500, type: "health" },
                    { x: 750, y: 300, type: "star" }
                ]
            }
        ];

        console.log(`关卡 ${levelNumber} 已创建`);
    }
    
    init() {
        // 清空当前关卡数据
        this.platforms = [];
        this.backgrounds = [];
        
        // 加载关卡数据 - 异步处理以避免阻塞
        requestAnimationFrame(() => {
            // 异步加载关卡对象
            setTimeout(() => {
                this.loadLevelData();
                this.createBackground();
                this.createPlatforms();
                
                // 创建敌人和收集物的数量较多，分批创建
                setTimeout(() => {
                    this.createEnemies();
                    this.createCollectibles();
                }, 50);
            }, 0);
        });
    }
    
    loadLevelData() {
        // 获取当前关卡数据
        this.levelData = this.levels[this.levelNumber - 1] || this.levels[0];
    }
    
    createBackground() {
        // 使用简单的背景颜色
        this.backgroundColor = this.levelData.background.color || "#87CEEB";
        
        // 创建视差背景层 - 使用更高效的方式
        this.backgrounds = [
            new BackgroundLayer(0, 0, this.width, this.height, this.backgroundColor, 0),
            new BackgroundLayer(0, 450, this.width, 150, "#5a3921", 0.2)
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
        
        // 重用或创建平台对象
        for (let i = 0; i < count; i++) {
            const data = platformsData[i];
            const platform = this.platformPool[i];
            
            // 重置平台属性
            platform.x = data.x;
            platform.y = data.y;
            platform.width = data.width;
            platform.height = data.height;
            platform.type = data.type || "normal";
            
            // 添加到活动平台列表
            this.platforms.push(platform);
        }
    }
    
    createEnemies() {
        // 批量创建敌人以提高性能
        const enemiesData = this.levelData.enemies;
        
        // 使用一个循环批量创建所有敌人
        for (let i = 0; i < enemiesData.length; i++) {
            const data = enemiesData[i];
            this.game.createEnemy(data.x, data.y, data.type);
        }
    }
    
    createCollectibles() {
        // 批量创建收集物以提高性能
        const collectiblesData = this.levelData.collectibles;
        
        // 使用一个循环批量创建所有收集物
        for (let i = 0; i < collectiblesData.length; i++) {
            const data = collectiblesData[i];
            this.game.createCollectible(data.x, data.y, data.type);
        }
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

        // 在关卡1绘制一些云
        if (this.levelNumber === 1) {
            // 绘制云朵
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.beginPath();
            ctx.arc(200, 100, 30, 0, Math.PI * 2);
            ctx.arc(230, 90, 25, 0, Math.PI * 2);
            ctx.arc(260, 100, 30, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(500, 150, 25, 0, Math.PI * 2);
            ctx.arc(530, 140, 20, 0, Math.PI * 2);
            ctx.arc(560, 150, 25, 0, Math.PI * 2);
            ctx.fill();
        }
    }
} 