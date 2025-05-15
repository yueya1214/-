import { Player } from './player.js';
import { Level } from './level.js';
import { InputHandler } from './input.js';
import { UI } from './ui.js';

export class Game {
    constructor() {
        console.log("游戏初始化中...");
        
        // 调试模式标志
        this.DEBUG = true;
        
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
            
            // 重新计算地面位置
            if (this.currentState === this.states.PLAYING) {
                this.groundLevel = this.gameHeight - 100;
            }
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
        
        // 键盘控制提示
        this.keyboardControls = {
            "左/右方向键": "移动",
            "空格键": "跳跃/二段跳",
            "Z键": "攻击",
            "X键": "特殊技能",
            "ESC键": "暂停游戏"
        };
        
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
        
        try {
            this.currentState = this.states.PLAYING;
            
            // 重置游戏状态
            this.score = 0;
            this.currentLevel = 1;
            this.gameOver = false;
            this.levelComplete = false;
            
            // 计算地面位置 - 位于屏幕底部上方100像素
            this.groundLevel = this.gameHeight - 100;
            console.log("地面位置设置为:", this.groundLevel);
            
            // 创建玩家 - 位于屏幕左侧，离地面一定高度
            this.player = new Player(100, this.groundLevel - 200, 50, 80, this);
            console.log("玩家已创建:", this.player);
            
            // 创建关卡
            console.log("开始创建关卡...");
            this.level = new Level(1, this);
            console.log("关卡创建完成:", this.level);
            
            // 隐藏所有屏幕但保留HUD
            console.log("隐藏屏幕...");
            this.ui.hideAllScreens();
            
            // 显示HUD
            console.log("显示HUD...");
            const hud = document.getElementById('hud');
            if (hud) {
                hud.style.display = 'flex';
                console.log("HUD显示设置为flex");
            } else {
                console.error("找不到HUD元素!");
            }
            
            // 更新UI
            console.log("更新UI...");
            this.ui.updateScore(this.score);
            this.ui.updateLevel(this.currentLevel);
            this.ui.updateHealth(100);
            this.ui.updateEnergy(100);
            
            // 记录开始时间戳（用于显示控制提示）
            this.startTimestamp = performance.now();
            
            // 启动游戏循环
            console.log("启动游戏循环...");
            this.lastTime = performance.now();
            this.animate(this.lastTime);
            console.log("游戏开始完成!");
        } catch (error) {
            console.error("游戏开始过程中出错:", error);
            alert("游戏启动错误: " + error.message);
            
            // 尝试恢复到菜单状态
            this.currentState = this.states.MENU;
            this.ui.showScreen('start-screen');
        }
    }
    
    animate(timestamp) {
        this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
        
        const deltaTime = Math.min(timestamp - this.lastTime, 33);
        this.lastTime = timestamp;
        
        // 清除画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 添加调试信息（仅当第一次进入游戏状态时）
        if (this.currentState === this.states.PLAYING && this.DEBUG) {
            if (!this._debugGameStarted) {
                console.log("游戏状态: PLAYING");
                console.log("玩家状态:", this.player);
                console.log("关卡状态:", this.level);
                console.log("动画循环开始");
                this._debugGameStarted = true;
            }
        }
        
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
                if (this.DEBUG) {
                    this.drawDebugInfo(deltaTime);
                } else {
                    // 非调试模式下的基本信息
                    this.ctx.fillStyle = 'white';
                    this.ctx.font = '14px Arial';
                    this.ctx.textAlign = 'left';
                    this.ctx.fillText(`关卡: ${this.currentLevel}`, 10, 60);
                }
                
                // 添加操作提示（只在游戏开始几秒内显示）
                if (timestamp - this.startTimestamp < 5000) {
                    this.drawControlsHelp();
                }

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
    
    // 绘制调试信息
    drawDebugInfo(deltaTime) {
        this.ctx.fillStyle = 'white';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'left';
        
        // 左上角信息
        this.ctx.fillText(`FPS: ${Math.round(1000 / deltaTime)}`, 10, 20);
        this.ctx.fillText(`玩家位置: X:${Math.round(this.player?.x || 0)} Y:${Math.round(this.player?.y || 0)}`, 10, 40);
        this.ctx.fillText(`关卡: ${this.currentLevel}`, 10, 60);
        this.ctx.fillText(`平台数: ${this.level?.platforms?.length || 0}`, 10, 80);
        this.ctx.fillText(`地面高度: ${this.groundLevel}`, 10, 100);
        
        // 右上角的玩家物理信息
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`速度X: ${this.player?.velocityX.toFixed(2) || 0}`, this.gameWidth - 10, 20);
        this.ctx.fillText(`速度Y: ${this.player?.velocityY.toFixed(2) || 0}`, this.gameWidth - 10, 40);
        this.ctx.fillText(`地面状态: ${this.player?.isGrounded}`, this.gameWidth - 10, 60);
        this.ctx.fillText(`跳跃状态: ${this.player?.isJumping}`, this.gameWidth - 10, 80);
        
        // 绘制网格背景（帮助定位）
        this.drawGrid(50);
    }
    
    // 绘制操作提示
    drawControlsHelp() {
        const padding = 20;
        const boxWidth = 200;
        const boxHeight = 150;
        const x = this.gameWidth - boxWidth - padding;
        const y = this.gameHeight - boxHeight - padding;
        
        // 半透明背景
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        this.ctx.fillRect(x, y, boxWidth, boxHeight);
        
        // 标题
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('操作提示', x + boxWidth/2, y + 25);
        
        // 控制说明
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'left';
        
        let yOffset = 50;
        for (const [key, action] of Object.entries(this.keyboardControls)) {
            this.ctx.fillText(`${key}: ${action}`, x + 15, y + yOffset);
            yOffset += 20;
        }
    }
    
    // 绘制调试网格
    drawGrid(gridSize) {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 0.5;
        
        // 垂直线
        for (let x = 0; x < this.gameWidth; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.gameHeight);
            this.ctx.stroke();
            
            // 每100像素添加标记
            if (x % 100 === 0) {
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                this.ctx.font = '10px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(x.toString(), x, 10);
            }
        }
        
        // 水平线
        for (let y = 0; y < this.gameHeight; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.gameWidth, y);
            this.ctx.stroke();
            
            // 每100像素添加标记
            if (y % 100 === 0) {
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                this.ctx.font = '10px Arial';
                this.ctx.textAlign = 'left';
                this.ctx.fillText(y.toString(), 5, y + 10);
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
    
    nextLevel() {
        console.log("进入下一关卡...");
        
        // 增加关卡
        this.currentLevel++;
        if (this.currentLevel > this.maxLevel) {
            // 如果到达最后一关，则返回第一关
            this.currentLevel = 1;
        }
        
        // 计算地面位置 - 确保与startGame一致
        this.groundLevel = this.gameHeight - 100;
        
        // 重置玩家位置
        if (this.player) {
            this.player.x = 100;
            this.player.y = this.groundLevel - 200;
            this.player.velocityX = 0;
            this.player.velocityY = 0;
        }
        
        // 创建新关卡
        this.level = new Level(this.currentLevel, this);
        
        // 隐藏所有屏幕但保留HUD
        this.ui.hideAllScreens();
        
        // 更新UI
        this.ui.updateLevel(this.currentLevel);
        
        // 切换到游戏状态
        this.currentState = this.states.PLAYING;
    }
    
    restart() {
        console.log("重新开始游戏...");
        
        // 重置关卡
        this.currentLevel = 1;
        
        // 重置分数
        this.score = 0;
        
        // 计算地面位置 - 确保与startGame一致
        this.groundLevel = this.gameHeight - 100;
        
        // 创建玩家
        this.player = new Player(100, this.groundLevel - 200, 50, 80, this);
        
        // 创建关卡
        this.level = new Level(1, this);
        
        // 隐藏所有屏幕但保留HUD
        this.ui.hideAllScreens();
        
        // 更新UI
        this.ui.updateScore(this.score);
        this.ui.updateLevel(this.currentLevel);
        this.ui.updateHealth(100);
        this.ui.updateEnergy(100);
        
        // 切换到游戏状态
        this.currentState = this.states.PLAYING;
    }
    
    // 创建敌人对象 - 目前简单实现为控制台记录
    createEnemy(x, y, type) {
        console.log(`创建敌人: (${x}, ${y}) 类型:${type}`);
        // 将来实现真正的敌人创建 - 简单起见现在只记录信息
        return {
            x, y, type,
            width: 40,
            height: 60,
            draw(ctx) {
                // 绘制简单的敌人图形
                ctx.fillStyle = '#ff0000';
                ctx.fillRect(this.x, this.y, this.width, this.height);
            }
        };
    }
    
    // 创建可收集物品 - 目前简单实现为控制台记录
    createCollectible(x, y, type) {
        console.log(`创建收集物: (${x}, ${y}) 类型:${type}`);
        // 将来实现真正的收集物创建 - 简单起见现在只记录信息
        return {
            x, y, type,
            width: 20,
            height: 20,
            draw(ctx) {
                // 绘制简单的收集物图形
                ctx.fillStyle = '#ffff00';
                ctx.beginPath();
                ctx.arc(this.x, this.y, 10, 0, Math.PI * 2);
                ctx.fill();
            }
        };
    }
}

// 创建游戏实例
window.addEventListener('DOMContentLoaded', () => {
    console.log("DOM加载完成，创建游戏实例...");
    window.game = new Game();
});