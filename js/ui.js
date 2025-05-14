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
        
        // 创建加载屏幕
        this.createLoadingScreen();
        
        // 初始显示开始屏幕
        this.showScreen('start-screen');
    }
    
    createLoadingScreen() {
        // 检查是否已存在加载屏幕
        if (document.getElementById('loading-screen')) {
            return;
        }

        // 创建加载屏幕
        const loadingScreen = document.createElement('div');
        loadingScreen.id = 'loading-screen';
        loadingScreen.className = 'screen';

        // 创建加载标题
        const loadingTitle = document.createElement('h2');
        loadingTitle.textContent = '加载中...';
        loadingScreen.appendChild(loadingTitle);

        // 创建进度条容器
        const progressContainer = document.createElement('div');
        progressContainer.className = 'progress-container';
        progressContainer.style.width = '300px';
        progressContainer.style.height = '20px';
        progressContainer.style.backgroundColor = '#222';
        progressContainer.style.border = '2px solid #555';
        progressContainer.style.borderRadius = '10px';
        progressContainer.style.overflow = 'hidden';
        progressContainer.style.margin = '20px 0';

        // 创建进度条
        const progressBar = document.createElement('div');
        progressBar.id = 'progress-bar';
        progressBar.style.width = '0%';
        progressBar.style.height = '100%';
        progressBar.style.backgroundColor = '#f8d61c';
        progressBar.style.transition = 'width 0.3s';
        progressContainer.appendChild(progressBar);
        loadingScreen.appendChild(progressContainer);

        // 创建提示文本
        const loadingTip = document.createElement('p');
        loadingTip.id = 'loading-tip';
        loadingTip.textContent = '准备冒险...';
        loadingTip.style.fontSize = '16px';
        loadingTip.style.color = '#aaa';
        loadingScreen.appendChild(loadingTip);

        // 将加载屏幕添加到游戏UI
        document.getElementById('game-ui').appendChild(loadingScreen);
    }
    
    updateLoadingProgress(progress) {
        const progressBar = document.getElementById('progress-bar');
        const loadingTip = document.getElementById('loading-tip');
        
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
        
        // 根据进度更新提示文本
        if (loadingTip) {
            if (progress < 25) {
                loadingTip.textContent = '加载游戏资源...';
            } else if (progress < 50) {
                loadingTip.textContent = '准备关卡数据...';
            } else if (progress < 75) {
                loadingTip.textContent = '生成游戏世界...';
            } else {
                loadingTip.textContent = '即将开始！';
            }
        }
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