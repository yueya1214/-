// 游戏配置
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 450,
    parent: 'game-canvas',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    pixelArt: false,
    roundPixels: true
};

// 游戏变量
let game;
let player;
let platforms;
let cursors;
let coins;
let enemies;
let spikes;
let finishFlag;
let scoreText;
let livesIcons;
let gameOver = false;
let score = 0;
let lives = 3;
let playerName = '玩家';
let sounds = {};

// 启动游戏
window.onload = function() {
    loadHighScores();
    setupEventListeners();
};

// 设置事件监听器
function setupEventListeners() {
    document.getElementById('start-button').addEventListener('click', startGame);
    document.getElementById('restart-button').addEventListener('click', restartGame);
}

// 开始游戏
function startGame() {
    const inputName = document.getElementById('player-name').value.trim();
    if (inputName) {
        playerName = inputName;
    }
    
    document.getElementById('start-screen').classList.add('hidden');
    
    if (!game) {
        game = new Phaser.Game(config);
    } else {
        restartGame();
    }
}

// 重新开始游戏
function restartGame() {
    document.getElementById('game-over-screen').classList.add('hidden');
    gameOver = false;
    score = 0;
    lives = 3;
    game.scene.start('default');
}

// 加载资源
function preload() {
    // 创建加载进度条
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(240, 270, 320, 50);
    
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const loadingText = this.make.text({
        x: width / 2,
        y: height / 2 - 50,
        text: '加载中...',
        style: {
            font: '20px monospace',
            fill: '#ffffff'
        }
    });
    loadingText.setOrigin(0.5, 0.5);
    
    const percentText = this.make.text({
        x: width / 2,
        y: height / 2 - 5,
        text: '0%',
        style: {
            font: '18px monospace',
            fill: '#ffffff'
        }
    });
    percentText.setOrigin(0.5, 0.5);
    
    this.load.on('progress', function (value) {
        percentText.setText(parseInt(value * 100) + '%');
        progressBar.clear();
        progressBar.fillStyle(0xffffff, 1);
        progressBar.fillRect(250, 280, 300 * value, 30);
    });
    
    this.load.on('complete', function () {
        progressBar.destroy();
        progressBox.destroy();
        loadingText.destroy();
        percentText.destroy();
    });
    
    // 加载游戏资源
    this.load.spritesheet('player', 'https://content.codecademy.com/courses/learn-phaser/Codey%20Tundra/codey.png', { 
        frameWidth: 72, 
        frameHeight: 90
    });
    
    // 特效精灵图
    this.load.spritesheet('explosion', 'https://examples.phaser.io/assets/particles/explosion.png', { 
        frameWidth: 64, 
        frameHeight: 64, 
        endFrame: 23 
    });
    
    // 平台和物品
    this.load.image('ground', 'https://examples.phaser.io/assets/sprites/platform.png');
    this.load.image('coin', 'https://examples.phaser.io/assets/sprites/coin.png');
    this.load.image('spike', 'https://examples.phaser.io/assets/sprites/saw.png');
    this.load.image('enemy', 'https://examples.phaser.io/assets/sprites/spaceman.png');
    this.load.image('flag', 'https://examples.phaser.io/assets/sprites/healthbar.png');
    this.load.image('background', 'https://examples.phaser.io/assets/skies/nebula.jpg');
    this.load.image('heart', 'https://examples.phaser.io/assets/sprites/phaser-dude.png');
    
    // 音效
    this.load.audio('jump', 'https://examples.phaser.io/assets/audio/SoundEffects/jump.mp3');
    this.load.audio('coin_collect', 'https://examples.phaser.io/assets/audio/SoundEffects/coin.mp3');
    this.load.audio('hurt', 'https://examples.phaser.io/assets/audio/SoundEffects/hurt.mp3');
    this.load.audio('gameOver', 'https://examples.phaser.io/assets/audio/SoundEffects/death.mp3');
    this.load.audio('victory', 'https://examples.phaser.io/assets/audio/SoundEffects/key.mp3');
    this.load.audio('attack', 'https://examples.phaser.io/assets/audio/SoundEffects/shot.mp3');
}

// 创建游戏
function create() {
    // 添加背景
    this.add.image(400, 225, 'background').setScale(2);
    
    // 创建音效
    sounds.jump = this.sound.add('jump');
    sounds.coinCollect = this.sound.add('coin_collect');
    sounds.hurt = this.sound.add('hurt');
    sounds.gameOver = this.sound.add('gameOver');
    sounds.victory = this.sound.add('victory');
    sounds.attack = this.sound.add('attack');
    
    // 创建平台组
    platforms = this.physics.add.staticGroup();
    
    // 创建地面
    platforms.create(400, 445, 'ground').setScale(2).refreshBody();
    
    // 创建平台
    platforms.create(600, 350, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(400, 200, 'ground');
    platforms.create(750, 150, 'ground');
    
    // 创建玩家
    player = this.physics.add.sprite(100, 350, 'player');
    player.setBounce(0.1);
    player.setCollideWorldBounds(true);
    player.body.setSize(player.width * 0.7, player.height * 0.8, true);
    player.isAttacking = false;
    player.invincible = false;
    
    // 创建玩家动画
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });
    
    this.anims.create({
        key: 'turn',
        frames: [ { key: 'player', frame: 4 } ],
        frameRate: 20
    });
    
    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('player', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });
    
    // 创建爆炸动画
    this.anims.create({
        key: 'explode',
        frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 23 }),
        frameRate: 20,
        hideOnComplete: true
    });
    
    // 设置攻击
    this.input.keyboard.on('keydown-SPACE', function() {
        if (!gameOver && !player.isAttacking) {
            attack();
        }
    });
    
    // 金币组
    coins = this.physics.add.group({
        key: 'coin',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });
    
    coins.children.iterate(function (child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        child.setCircle(12);
    });
    
    // 敌人组
    enemies = this.physics.add.group();
    createEnemy(300, 0);
    createEnemy(500, 0);
    createEnemy(700, 0);
    
    // 障碍组
    spikes = this.physics.add.group();
    spikes.create(300, 350, 'spike');
    spikes.create(550, 150, 'spike');
    spikes.create(150, 250, 'spike');
    
    spikes.children.iterate(function (child) {
        child.setScale(0.5);
        child.setCircle(20);
        child.setBounce(0);
    });
    
    // 终点旗帜
    finishFlag = this.physics.add.sprite(750, 100, 'flag');
    finishFlag.setScale(0.5);
    
    // 添加UI
    const gameUI = document.createElement('div');
    gameUI.className = 'game-ui';
    gameUI.innerHTML = `得分: <span id="score-value">0</span>`;
    document.getElementById('game-canvas').appendChild(gameUI);
    
    scoreText = { setText: function(val) { document.getElementById('score-value').innerText = val; } };
    scoreText.setText('0');
    
    // 生命图标
    livesIcons = this.add.group();
    updateLivesDisplay(this);
    
    // 碰撞检测
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(coins, platforms);
    this.physics.add.collider(enemies, platforms);
    this.physics.add.collider(spikes, platforms);
    
    this.physics.add.overlap(player, coins, collectCoin, null, this);
    this.physics.add.overlap(player, enemies, hitEnemy, null, this);
    this.physics.add.overlap(player, spikes, hitSpike, null, this);
    this.physics.add.overlap(player, finishFlag, reachFinish, null, this);
    
    // 获取方向键
    cursors = this.input.keyboard.createCursorKeys();
}

// 更新游戏状态
function update() {
    if (gameOver) {
        return;
    }
    
    // 水平移动
    if (cursors.left.isDown) {
        player.setVelocityX(-200);
        if (player.body.touching.down) {
            player.anims.play('left', true);
        }
    } else if (cursors.right.isDown) {
        player.setVelocityX(200);
        if (player.body.touching.down) {
            player.anims.play('right', true);
        }
    } else {
        player.setVelocityX(0);
        if (player.body.touching.down) {
            player.anims.play('turn');
        }
    }
    
    // 跳跃
    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-500);
        sounds.jump.play();
    }
    
    // 移动敌人
    enemies.children.iterate(function(enemy) {
        if (enemy.active) {
            if (enemy.body.velocity.x === 0) {
                const dir = Phaser.Math.Between(0, 1) ? -1 : 1;
                enemy.setVelocityX(50 * dir);
                enemy.direction = dir;
            }
            
            // 改变方向
            if (enemy.body.blocked.left) {
                enemy.setVelocityX(50);
                enemy.direction = 1;
            } else if (enemy.body.blocked.right) {
                enemy.setVelocityX(-50);
                enemy.direction = -1;
            }
            
            // 旋转敌人
            enemy.rotation += 0.01 * enemy.direction;
        }
    });
    
    // 旋转金币
    coins.children.iterate(function(coin) {
        if (coin.active) {
            coin.rotation += 0.05;
        }
    });
    
    // 旋转障碍物
    spikes.children.iterate(function(spike) {
        if (spike.active) {
            spike.rotation += 0.02;
        }
    });
}

// 创建敌人
function createEnemy(x, y) {
    const enemy = enemies.create(x, y, 'enemy');
    enemy.setBounce(0.2);
    enemy.setCollideWorldBounds(true);
    enemy.setVelocityX(Phaser.Math.Between(-50, 50));
    enemy.direction = enemy.body.velocity.x > 0 ? 1 : -1;
    enemy.setCircle(20);
    return enemy;
}

// 收集金币
function collectCoin(player, coin) {
    coin.disableBody(true, true);
    sounds.coinCollect.play();
    
    // 增加分数
    score += 10;
    scoreText.setText(score);
    
    // 特效
    const explosion = this.add.sprite(coin.x, coin.y, 'explosion').setScale(0.5);
    explosion.play('explode');
    
    // 创建漂浮文本
    const floatingText = this.add.text(coin.x, coin.y - 20, '+10', { 
        fontSize: '20px', 
        fill: '#ffff00',
        stroke: '#000',
        strokeThickness: 3
    }).setOrigin(0.5);
    
    this.tweens.add({
        targets: floatingText,
        y: floatingText.y - 50,
        alpha: 0,
        duration: 1000,
        onComplete: function() { floatingText.destroy(); }
    });
    
    // 如果收集了所有金币，创建新的一批
    if (coins.countActive(true) === 0) {
        coins.children.iterate(function (child) {
            child.enableBody(true, child.x, 0, true, true);
        });
    }
}

// 攻击敌人
function attack() {
    player.isAttacking = true;
    sounds.attack.play();
    
    // 攻击动画效果
    const attackCircle = game.scene.scenes[0].add.circle(
        player.x + (player.flipX ? -40 : 40), 
        player.y, 
        40, 
        0xffa500, 
        0.7
    );
    
    // 检查攻击范围内的敌人
    enemies.children.iterate(function(enemy) {
        if (enemy.active && Phaser.Math.Distance.Between(attackCircle.x, attackCircle.y, enemy.x, enemy.y) < 60) {
            destroyEnemy(enemy);
        }
    });
    
    // 淡出攻击效果
    game.scene.scenes[0].tweens.add({
        targets: attackCircle,
        alpha: 0,
        scale: 1.5,
        duration: 300,
        onComplete: function() { 
            attackCircle.destroy();
            player.isAttacking = false;
        }
    });
}

// 销毁敌人
function destroyEnemy(enemy) {
    // 增加分数
    score += 20;
    scoreText.setText(score);
    
    // 特效
    const explosion = game.scene.scenes[0].add.sprite(enemy.x, enemy.y, 'explosion');
    explosion.play('explode');
    sounds.hurt.play();
    
    // 创建漂浮文本
    const floatingText = game.scene.scenes[0].add.text(enemy.x, enemy.y - 30, '+20', { 
        fontSize: '24px', 
        fill: '#ff0000',
        stroke: '#000',
        strokeThickness: 3
    }).setOrigin(0.5);
    
    game.scene.scenes[0].tweens.add({
        targets: floatingText,
        y: floatingText.y - 80,
        alpha: 0,
        duration: 1500,
        onComplete: function() { floatingText.destroy(); }
    });
    
    enemy.disableBody(true, true);
    
    // 随机掉落金币
    if (Phaser.Math.Between(0, 10) > 5) {
        const coin = coins.create(enemy.x, enemy.y, 'coin');
        coin.setBounceY(0.4);
        coin.setCircle(12);
    }
}

// 碰到敌人
function hitEnemy(player, enemy) {
    if (player.invincible) return;
    
    handleDamage();
}

// 碰到尖刺
function hitSpike(player, spike) {
    if (player.invincible) return;
    
    handleDamage();
}

// 处理伤害
function handleDamage() {
    lives--;
    updateLivesDisplay(game.scene.scenes[0]);
    sounds.hurt.play();
    
    // 设置无敌时间
    player.invincible = true;
    player.alpha = 0.5;
    
    // 击退效果
    const knockbackX = player.x < 400 ? 150 : -150;
    player.setVelocity(knockbackX, -200);
    
    // 闪烁动画
    game.scene.scenes[0].tweens.add({
        targets: player,
        alpha: { from: 0.5, to: 1 },
        duration: 100,
        repeat: 10,
        yoyo: true,
        onComplete: function() {
            player.alpha = 1;
            player.invincible = false;
        }
    });
    
    // 检查游戏结束
    if (lives <= 0) {
        endGame(false);
    }
}

// 更新生命显示
function updateLivesDisplay(scene) {
    livesIcons.clear(true, true);
    
    for (let i = 0; i < lives; i++) {
        const icon = scene.add.image(720 - (i * 30), 30, 'heart').setScrollFactor(0);
        icon.setScale(0.5);
        livesIcons.add(icon);
    }
}

// 到达终点
function reachFinish(player, flag) {
    finishFlag.disableBody(true, true);
    sounds.victory.play();
    
    // 增加得分
    score += 100;
    scoreText.setText(score);
    
    // 胜利特效
    const victoryText = this.add.text(400, 200, '任务完成!', { 
        fontSize: '48px',
        fill: '#fff',
        stroke: '#000',
        strokeThickness: 6,
        fontStyle: 'bold'
    }).setOrigin(0.5);
    
    this.tweens.add({
        targets: victoryText,
        scale: 1.5,
        duration: 2000,
        ease: 'Sine.easeInOut',
        yoyo: true,
        onComplete: function() {
            endGame(true);
        }
    });
    
    // 禁用玩家移动
    player.setVelocity(0, 0);
    gameOver = true;
}

// 游戏结束
function endGame(victory) {
    gameOver = true;
    document.getElementById('final-score').textContent = score;
    document.getElementById('game-over-screen').classList.remove('hidden');
    
    if (!victory) {
        sounds.gameOver.play();
    }
    
    // 保存分数
    saveScore(playerName, score);
}

// 加载高分
async function loadHighScores() {
    try {
        const response = await fetch('/api/score');
        if (!response.ok) throw new Error('Failed to fetch high scores');
        
        const scores = await response.json();
        const highScoresList = document.getElementById('high-scores-list');
        
        if (scores.length === 0) {
            highScoresList.innerHTML = '<p>还没有记录</p>';
            return;
        }
        
        highScoresList.innerHTML = '';
        scores.forEach((score, index) => {
            const scoreItem = document.createElement('div');
            scoreItem.className = 'score-item';
            scoreItem.innerHTML = `
                <span><span class="score-rank">#${index + 1}</span> ${score.player_name}</span>
                <span>${score.score}</span>
            `;
            highScoresList.appendChild(scoreItem);
        });
    } catch (error) {
        console.error('Error loading high scores:', error);
        document.getElementById('high-scores-list').innerHTML = '<p>无法加载分数</p>';
    }
}

// 保存分数
async function saveScore(playerName, score) {
    try {
        const response = await fetch('/api/score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ player_name: playerName, score: score })
        });
        
        if (!response.ok) throw new Error('Failed to save score');
        
        // 刷新高分列表
        loadHighScores();
    } catch (error) {
        console.error('Error saving score:', error);
    }
}

// 辅助函数 - 随机整数
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
} 