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
        this.ctx = this.canvas.getContext('2d', { alpha: false }); // 禁用alpha通道提高性能
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
            LOADING: 1,
            PLAYING: 2,
            PAUSED: 3,
            LEVEL_COMPLETE: 4,
            GAME_OVER: 5,
            INSTRUCTIONS: 6
        };
        this.currentState = this.states.MENU;
        
        // 用于性能监控
        this.fpsCounter = 0;
        this.fpsTimer = 0;
        this.currentFps = 0;
        
        // 加载状态
        this.loadingProgress = 0;
        
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
        // 显示加载屏幕
        this.ui.showScreen('loading-screen');
        this.currentState = this.states.LOADING;
        
        // 模拟加载进度
        let progress = 0;
        const loadingInterval = setInterval(() => {
            progress += 5;
            this.loadingProgress = progress;
            this.ui.updateLoadingProgress(progress);
            
            if (progress >= 100) {
                clearInterval(loadingInterval);
                // 资源加载完成后显示菜单
                setTimeout(() => {
                    this.ui.showScreen('start-screen');
                    this.currentState = this.states.MENU;
                }, 500);
            }
        }, 100);
    }
    
    startGame() {
        // 显示加载屏幕
        this.ui.showScreen('loading-screen');
        this.currentState = this.states.LOADING;
        this.loadingProgress = 0;
        
        // 重置游戏状态
        this.score = 0;
        this.currentLevel = 1;
        this.gameOver = false;
        this.levelComplete = false;
        
        // 使用requestAnimationFrame和setTimeout来避免UI阻塞
        requestAnimationFrame(() => {
            setTimeout(() => {
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
                    this.lastTime = performance.now();
                    this.animate(this.lastTime);
                }
            }, 100);
        });
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
        // 显示加载屏幕
        this.ui.showScreen('loading-screen');
        this.currentState = this.states.LOADING;
        this.loadingProgress = 0;
        
        // 使用setTimeout避免UI阻塞
        setTimeout(() => {
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
        }, 500);
    }
    
    animate(timestamp) {
        this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
        
        // 计算delta时间，并限制最大值以避免大延迟造成的问题
        const deltaTime = Math.min(timestamp - this.lastTime, 33); // 最大约33ms (30fps)
        this.lastTime = timestamp;
        
        // FPS计算
        this.fpsCounter++;
        this.fpsTimer += deltaTime;
        if (this.fpsTimer >= 1000) {
            this.currentFps = this.fpsCounter;
            this.fpsCounter = 0;
            this.fpsTimer = 0;
        }
        
        // 根据游戏状态执行不同的更新逻辑
        if (this.currentState === this.states.LOADING) {
            // 加载状态 - 只绘制加载进度
            this.ctx.fillStyle = '#222';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            return;
        }
        
        if (this.currentState === this.states.PLAYING) {
            // 清除画布
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // 更新和绘制关卡
            this.level.update(deltaTime);
            this.level.draw(this.ctx);
            
            // 更新和绘制玩家
            this.player.update(deltaTime, this.input.keys);
            this.player.draw(this.ctx);
            
            // 批量更新和绘制敌人，减少迭代次数
            for (let i = this.enemies.length - 1; i >= 0; i--) {
                const enemy = this.enemies[i];
                enemy.update(deltaTime);
                enemy.draw(this.ctx);
                
                // 检查敌人是否被击中
                if (enemy.health <= 0) {
                    this.enemies.splice(i, 1);
                    this.score += enemy.points;
                    this.ui.updateScore(this.score);
                    this.createParticles(enemy.x, enemy.y, 6, '#ff6666'); // 减少粒子数量
                    this.soundManager.playSound('enemy-death');
                }
            }
            
            // 批量更新和绘制粒子，减少迭代次数
            for (let i = this.particles.length - 1; i >= 0; i--) {
                const particle = this.particles[i];
                particle.update();
                particle.draw(this.ctx);
                
                if (particle.alpha <= 0) {
                    this.particles.splice(i, 1);
                }
            }
            
            // 批量更新和绘制收集物，减少迭代次数
            for (let i = this.collectibles.length - 1; i >= 0; i--) {
                const item = this.collectibles[i];
                item.update();
                item.draw(this.ctx);
                
                // 检查是否被收集
                if (this.player.collidesWith(item)) {
                    this.collectibles.splice(i, 1);
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
            }
            
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
            
            // 显示FPS (仅调试用)
            // this.ctx.fillStyle = '#fff';
            // this.ctx.font = '12px Arial';
            // this.ctx.fillText(`FPS: ${this.currentFps}`, 10, 20);
        }
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
        // 取消现有的动画帧
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
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