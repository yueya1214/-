import { Player } from './player.js';
import { Level } from './level.js';
import { InputHandler } from './input.js';
import { UI } from './ui.js';

export class Game {
    constructor() {
        console.log("游戏初始化中...");
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d', { alpha: false });
        
        // 设置canvas尺寸为窗口大小
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // 监听窗口大小变化，调整canvas尺寸
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.gameWidth = this.canvas.width;
            this.gameHeight = this.canvas.height;
        });
        
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
        
        // 计算地面位置 - 位于屏幕底部上方100像素
        this.groundLevel = this.gameHeight - 100;
        
        // 创建玩家 - 位于屏幕左侧，离地面一定高度
        this.player = new Player(100, this.groundLevel - 200, 50, 80, this);
        
        // 创建关卡
        this.level = new Level(1, this);
        
        // 隐藏所有屏幕但保留HUD
        this.ui.hideAllScreens();
        // 显示HUD
        document.getElementById('hud').style.display = 'flex';
        
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
        this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
        
        const deltaTime = Math.min(timestamp - this.lastTime, 33);
        this.lastTime = timestamp;
        
        // 清除画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.currentState === this.states.PLAYING) {
            try {
                // 确保HUD在PLAYING状态下可见
                document.getElementById('hud').style.display = 'flex';
                
                // 1. 更新和绘制关卡 (背景、平台等)
                if (this.level) {
                    this.level.update(deltaTime);
                    this.level.draw(this.ctx);
                }
                
                // 2. 更新和绘制玩家 (在关卡之上)
                if (this.player) {
                    this.player.update(deltaTime, this.input.keys);
                    this.player.draw(this.ctx);
                }
                
                // 调试信息
                this.ctx.fillStyle = 'white'; // 确保调试文字颜色可见
                this.ctx.font = '14px Arial';
                this.ctx.textAlign = 'left';
                this.ctx.fillText(`FPS: ${Math.round(1000 / deltaTime)}`, 10, 20);
                this.ctx.fillText(`玩家位置: X:${Math.round(this.player?.x || 0)} Y:${Math.round(this.player?.y || 0)}`, 10, 40);
                this.ctx.fillText(`关卡: ${this.currentLevel}`, 10, 60);
                this.ctx.fillText(`平台数: ${this.level?.platforms?.length || 0}`, 10, 80);

            } catch (error) {
                console.error("游戏循环出错:", error);
                // 显示错误到画布
                this.ctx.fillStyle = '#333';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.fillStyle = '#ff0000';
                this.ctx.font = '20px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(`游戏运行错误: ${error.message}`, this.canvas.width / 2, this.canvas.height / 2);
            }
        } else {
            // 如果不在PLAYING状态，确保HUD隐藏
            // (除非特定屏幕需要它，例如游戏结束屏幕可能也使用部分HUD元素)
            const hudElement = document.getElementById('hud');
            if (hudElement) {
                 hudElement.style.display = 'none';
            }
           
            // 如果是菜单状态，并且 drawTestScreen 存在，则调用它
            if (this.currentState === this.states.MENU && this.drawTestScreen) {
                this.drawTestScreen(); 
            }
        }
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