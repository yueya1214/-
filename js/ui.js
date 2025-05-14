export class UI {
    constructor(game) {
        this.game = game;
        
        // 获取UI元素
        this.startScreen = document.getElementById('start-screen');
        this.levelCompleteScreen = document.getElementById('level-complete');
        this.gameOverScreen = document.getElementById('game-over');
        this.instructionsScreen = document.getElementById('instructions-screen');
        
        this.startButton = document.getElementById('start-button');
        this.nextLevelButton = document.getElementById('next-level-button');
        this.restartButton = document.getElementById('restart-button');
        this.instructionsButton = document.getElementById('instructions-button');
        this.backButton = document.getElementById('back-button');
        
        this.levelScore = document.getElementById('level-score');
        this.finalScore = document.getElementById('final-score');
        this.score = document.getElementById('score');
        this.level = document.getElementById('level');
        this.healthBar = document.getElementById('health-bar');
        this.energyBar = document.getElementById('energy-bar');
        
        // 初始显示开始屏幕
        this.showScreen('start-screen');
    }
    
    registerEvents(game) {
        // 开始按钮
        this.startButton.addEventListener('click', () => {
            game.startGame();
        });
        
        // 下一关按钮
        this.nextLevelButton.addEventListener('click', () => {
            game.nextLevel();
        });
        
        // 重新开始按钮
        this.restartButton.addEventListener('click', () => {
            game.restart();
        });
        
        // 游戏说明按钮
        this.instructionsButton.addEventListener('click', () => {
            this.showScreen('instructions-screen');
            game.currentState = game.states.INSTRUCTIONS;
        });
        
        // 返回按钮
        this.backButton.addEventListener('click', () => {
            this.showScreen('start-screen');
            game.currentState = game.states.MENU;
        });
        
        // ESC键暂停
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && 
                game.currentState === game.states.PLAYING) {
                game.togglePause();
            }
        });
    }
    
    showScreen(screenId) {
        // 隐藏所有屏幕
        this.hideAllScreens();
        
        // 显示指定屏幕
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.add('active');
        }
    }
    
    hideAllScreens() {
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => {
            screen.classList.remove('active');
        });
    }
    
    updateScore(score) {
        if (this.score) {
            this.score.textContent = `得分: ${score}`;
        }
    }
    
    updateLevel(level) {
        if (this.level) {
            this.level.textContent = `关卡: ${level}`;
        }
    }
    
    updateHealth(health) {
        if (this.healthBar) {
            const percent = health + '%';
            this.healthBar.style.setProperty('--health-percent', percent);
            this.healthBar.querySelector('::before').style.width = percent;
        }
    }
    
    updateEnergy(energy) {
        if (this.energyBar) {
            const percent = energy + '%';
            this.energyBar.style.setProperty('--energy-percent', percent);
            this.energyBar.querySelector('::before').style.width = percent;
        }
    }
    
    updateLevelScore(score) {
        if (this.levelScore) {
            this.levelScore.textContent = score;
        }
    }
    
    updateFinalScore(score) {
        if (this.finalScore) {
            this.finalScore.textContent = score;
        }
    }
    
    addItem(type) {
        const itemsContainer = document.getElementById('items');
        if (itemsContainer) {
            const item = document.createElement('div');
            item.className = 'item';
            
            // 根据不同物品类型设置不同图标
            switch(type) {
                case 'key':
                    item.textContent = '🔑';
                    break;
                case 'heart':
                    item.textContent = '❤️';
                    break;
                case 'star':
                    item.textContent = '⭐';
                    break;
                default:
                    item.textContent = '?';
            }
            
            itemsContainer.appendChild(item);
        }
    }
    
    clearItems() {
        const itemsContainer = document.getElementById('items');
        if (itemsContainer) {
            itemsContainer.innerHTML = '';
        }
    }
    
    shake() {
        // 简单的屏幕震动效果
        const canvas = document.getElementById('game-canvas');
        canvas.classList.add('shake');
        
        setTimeout(() => {
            canvas.classList.remove('shake');
        }, 500);
    }
    
    flash(color) {
        // 屏幕闪烁效果
        const overlay = document.createElement('div');
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = color;
        overlay.style.opacity = '0.3';
        overlay.style.pointerEvents = 'none';
        
        document.querySelector('.game-container').appendChild(overlay);
        
        setTimeout(() => {
            overlay.remove();
        }, 100);
    }
} 