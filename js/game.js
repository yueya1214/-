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
        console.log("游戏初始化中...");
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d', { alpha: false });
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        // 首先创建UI
        this.ui = new UI(this);
        this.input = new InputHandler();
        
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
        console.log("正在注册UI事件...");
        // 注册UI事件
        this.ui.registerEvents(this);
        
        // 显示开始屏幕
        this.ui.showScreen('start-screen');
        
        // 测试绘制
        this.drawTestScreen();
    }
    
    drawTestScreen() {
        console.log("绘制测试屏幕...");
        // 绘制一个简单的测试屏幕
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#f8d61c';
        this.ctx.font = '30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('游戏引擎初始化成功', this.canvas.width / 2, this.canvas.height / 2);
        
        this.ctx.font = '20px Arial';
        this.ctx.fillText('点击"开始游戏"按钮开始', this.canvas.width / 2, this.canvas.height / 2 + 40);
    }
    
    startGame() {
        console.log("开始游戏...");
        this.currentState = this.states.PLAYING;
        
        // 重置游戏状态
        this.score = 0;
        this.currentLevel = 1;
        this.gameOver = false;
        this.levelComplete = false;
        
        // 创建玩家
        this.player = new Player(100, 300, 50, 80, this);
        
        // 创建关卡
        this.level = new Level(1, this);
        
        // 隐藏所有屏幕
        this.ui.hideAllScreens();
        
        // 更新UI
        this.ui.updateScore(this.score);
        this.ui.updateLevel(this.currentLevel);
        this.ui.updateHealth(100);
        this.ui.updateEnergy(100);
        
        // 启动游戏循环
        this.lastTime = performance.now();
        this.animate(this.lastTime);
    }
    
    animate(timestamp) {
        const deltaTime = Math.min(timestamp - this.lastTime, 33);
        this.lastTime = timestamp;
        
        // 清除画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.currentState === this.states.PLAYING) {
            // 绘制游戏背景
            this.ctx.fillStyle = '#87CEEB';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // 绘制地面
            this.ctx.fillStyle = '#3a7d2d';
            this.ctx.fillRect(0, 500, this.canvas.width, 100);
            
            // 更新和绘制玩家
            if (this.player) {
                this.player.update(deltaTime, this.input.keys);
                this.player.draw(this.ctx);
            }
            
            // 更新和绘制关卡
            if (this.level) {
                this.level.update(deltaTime);
                this.level.draw(this.ctx);
            }
        }
        
        this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
    }
    
    togglePause() {
        this.paused = !this.paused;
        if (this.paused) {
            this.currentState = this.states.PAUSED;
            this.ui.showScreen('pause-screen');
        } else {
            this.currentState = this.states.PLAYING;
            this.ui.hideAllScreens();
        }
    }
}

// 创建游戏实例
window.addEventListener('DOMContentLoaded', () => {
    console.log("DOM加载完成，创建游戏实例...");
    window.game = new Game();
}); 