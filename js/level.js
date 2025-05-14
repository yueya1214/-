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
    }
    
    init() {
        // 清空当前关卡数据
        this.platforms = [];
        this.backgrounds = [];
        
        // 加载关卡数据
        this.loadLevelData();
        
        // 创建背景
        this.createBackground();
        
        // 创建平台
        this.createPlatforms();
        
        // 创建敌人
        this.createEnemies();
        
        // 创建收集物
        this.createCollectibles();
    }
    
    loadLevelData() {
        // 关卡数据定义
        const levels = [
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
        
        // 获取当前关卡数据
        this.levelData = levels[this.levelNumber - 1] || levels[0];
    }
    
    createBackground() {
        // 使用简单的背景颜色
        this.backgroundColor = this.levelData.background.color || "#87CEEB";
        
        // 创建视差背景层
        // 注意：实际实现中需要加载图片，这里简化处理
        this.backgrounds = [
            new BackgroundLayer(0, 0, this.width, this.height, "#87CEEB", 0),
            new BackgroundLayer(0, 450, this.width, 150, "#5a3921", 0.2)
        ];
    }
    
    createPlatforms() {
        // 创建平台
        this.levelData.platforms.forEach(platform => {
            this.platforms.push(
                new Platform(
                    platform.x,
                    platform.y,
                    platform.width,
                    platform.height,
                    platform.type
                )
            );
        });
    }
    
    createEnemies() {
        // 创建敌人
        this.levelData.enemies.forEach(enemy => {
            this.game.createEnemy(enemy.x, enemy.y, enemy.type);
        });
    }
    
    createCollectibles() {
        // 创建收集物
        this.levelData.collectibles.forEach(item => {
            this.game.createCollectible(item.x, item.y, item.type);
        });
    }
    
    update(deltaTime) {
        // 更新背景
        this.backgrounds.forEach(layer => {
            layer.update(this.game.player?.velocityX || 0);
        });
    }
    
    draw(ctx) {
        // 清除背景
        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(0, 0, this.width, this.height);
        
        // 绘制背景层
        this.backgrounds.forEach(layer => {
            layer.draw(ctx);
        });
        
        // 绘制平台
        this.platforms.forEach(platform => {
            platform.draw(ctx);
        });
    }
} 