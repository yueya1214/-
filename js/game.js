import { Player } from './player.js';
import { Level } from './level.js';
import { InputHandler } from './input.js';
import { UI } from './ui.js';
import { Enemy } from './enemy.js';
import { Particle } from './particle.js';
import { CollectibleItem } from './collectible.js';
import { SoundManager } from './sound.js';

export class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        this.ui = new UI(this);
        this.input = new InputHandler();
        this.soundManager = new SoundManager();
        
        this.gameWidth = this.canvas.width;
        this.gameHeight = this.canvas.height;
        this.gravity = 0.5;
        this.friction = 0.9;
        
        this.player = null;
        this.level = null;
        this.currentLevel = 1;
        this.maxLevel = 3;
        this.score = 0;
        this.gameOver = false;
        this.paused = false;
        this.levelComplete = false;
        
        this.enemies = [];
        this.particles = [];
        this.collectibles = [];
        
        // 游戏状态
        this.states = {
            MENU: 0,
            PLAYING: 1,
            PAUSED: 2,
            LEVEL_COMPLETE: 3,
            GAME_OVER: 4,
            INSTRUCTIONS: 5
        };
        this.currentState = this.states.MENU;
        
        // 初始化游戏
        this.init();
    }
    
    init() {
        // 注册UI事件
        this.ui.registerEvents(this);
        
        // 预加载资源
        this.preloadAssets();
    }
    
    preloadAssets() {
        // 创建加载屏幕并加载所有资源
        const assetsLoaded = () => {
            // 资源加载完成后显示菜单
            this.ui.showScreen('start-screen');
        };
        
        // 在这里实际上会加载游戏资源，简化处理直接调用回调
        assetsLoaded();
    }
    
    startGame() {
        this.score = 0;
        this.currentLevel = 1;
        this.gameOver = false;
        this.levelComplete = false;
        
        this.loadLevel(this.currentLevel);
        this.currentState = this.states.PLAYING;
        
        this.ui.hideAllScreens();
        this.ui.updateScore(this.score);
        this.ui.updateLevel(this.currentLevel);
        this.ui.updateHealth(100);
        this.ui.updateEnergy(100);
        
        this.soundManager.playMusic('background');
        
        // 启动游戏循环
        if (!this.animationFrameId) {
            this.lastTime = 0;
            this.animate(0);
        }
    }
    
    loadLevel(levelNumber) {
        this.enemies = [];
        this.particles = [];
        this.collectibles = [];
        
        // 创建玩家
        const playerSpawn = { x: 100, y: 300 };
        this.player = new Player(
            playerSpawn.x, 
            playerSpawn.y, 
            50, 
            80, 
            this
        );
        
        // 加载关卡
        this.level = new Level(levelNumber, this);
        this.level.init();
    }
    
    nextLevel() {
        this.currentLevel++;
        if (this.currentLevel > this.maxLevel) {
            // 所有关卡都完成了，游戏胜利
            this.gameOver = true;
            this.currentState = this.states.GAME_OVER;
            this.ui.showScreen('game-over');
            this.ui.updateFinalScore(this.score);
            this.soundManager.playSound('victory');
        } else {
            // 加载下一关
            this.loadLevel(this.currentLevel);
            this.currentState = this.states.PLAYING;
            this.ui.hideAllScreens();
            this.ui.updateLevel(this.currentLevel);
            this.soundManager.playSound('level-start');
        }
    }
    
    animate(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        if (this.currentState === this.states.PLAYING) {
            // 清除画布
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // 更新和绘制关卡
            this.level.update(deltaTime);
            this.level.draw(this.ctx);
            
            // 更新和绘制玩家
            this.player.update(deltaTime, this.input.keys);
            this.player.draw(this.ctx);
            
            // 更新和绘制敌人
            this.enemies.forEach((enemy, index) => {
                enemy.update(deltaTime);
                enemy.draw(this.ctx);
                
                // 检查敌人是否被击中
                if (enemy.health <= 0) {
                    this.enemies.splice(index, 1);
                    this.score += enemy.points;
                    this.ui.updateScore(this.score);
                    this.createParticles(enemy.x, enemy.y, 10, '#ff6666');
                    this.soundManager.playSound('enemy-death');
                }
            });
            
            // 更新和绘制粒子
            this.particles.forEach((particle, index) => {
                particle.update();
                particle.draw(this.ctx);
                
                if (particle.alpha <= 0) {
                    this.particles.splice(index, 1);
                }
            });
            
            // 更新和绘制收集物
            this.collectibles.forEach((item, index) => {
                item.update();
                item.draw(this.ctx);
                
                // 检查是否被收集
                if (this.player.collidesWith(item)) {
                    this.collectibles.splice(index, 1);
                    this.score += item.points;
                    this.ui.updateScore(this.score);
                    
                    // 应用物品效果
                    if (item.type === 'health') {
                        this.player.health = Math.min(100, this.player.health + 25);
                        this.ui.updateHealth(this.player.health);
                        this.soundManager.playSound('health-pickup');
                    } else if (item.type === 'energy') {
                        this.player.energy = Math.min(100, this.player.energy + 25);
                        this.ui.updateEnergy(this.player.energy);
                        this.soundManager.playSound('energy-pickup');
                    } else {
                        this.soundManager.playSound('coin-pickup');
                    }
                }
            });
            
            // 检查关卡是否完成
            if (this.player.x > this.gameWidth - 100 && !this.levelComplete) {
                this.levelComplete = true;
                this.currentState = this.states.LEVEL_COMPLETE;
                this.ui.showScreen('level-complete');
                this.ui.updateLevelScore(this.score);
                this.soundManager.playSound('level-complete');
            }
            
            // 检查玩家是否死亡
            if (this.player.health <= 0 && !this.gameOver) {
                this.gameOver = true;
                this.currentState = this.states.GAME_OVER;
                this.ui.showScreen('game-over');
                this.ui.updateFinalScore(this.score);
                this.soundManager.playSound('game-over');
            }
        }
        
        this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
    }
    
    createEnemy(x, y, type) {
        const enemy = new Enemy(x, y, type, this);
        this.enemies.push(enemy);
        return enemy;
    }
    
    createCollectible(x, y, type) {
        const item = new CollectibleItem(x, y, type, this);
        this.collectibles.push(item);
        return item;
    }
    
    createParticles(x, y, count, color) {
        for (let i = 0; i < count; i++) {
            const particle = new Particle(x, y, color, this);
            this.particles.push(particle);
        }
    }
    
    restart() {
        this.startGame();
    }
    
    togglePause() {
        this.paused = !this.paused;
        if (this.paused) {
            this.currentState = this.states.PAUSED;
            this.ui.showScreen('pause-screen');
            this.soundManager.pauseMusic();
        } else {
            this.currentState = this.states.PLAYING;
            this.ui.hideAllScreens();
            this.soundManager.resumeMusic();
        }
    }
}

// 创建游戏实例
window.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
}); 