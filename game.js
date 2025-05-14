// 游戏配置
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1000 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// 游戏变量
let game = new Phaser.Game(config);
let player;
let platforms;
let coins;
let enemies;
let cursors;
let scoreText;
let livesText;
let score = 0;
let lives = 3;
let gameOver = false;
let finishLine;
let playerDirection = 'right';
let jumpSound;
let coinSound;

// 资源预加载
function preload() {
    // 加载图像
    this.load.image('sky', 'https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/skies/space3.png');
    this.load.image('ground', 'https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/sprites/platform.png');
    this.load.image('coin', 'https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/sprites/coin.png');
    this.load.image('flag', 'https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/sprites/healthbar.png');
    
    // 创建简单的火柴人纹理
    this.load.on('complete', () => {
        createStickmanTexture(this);
        createEnemyTexture(this);
    });
    
    // 加载音效
    this.load.audio('jump', 'https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/audio/SoundEffects/jump.wav');
    this.load.audio('coin', 'https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/audio/SoundEffects/coin.wav');
}

// 创建火柴人纹理
function createStickmanTexture(scene) {
    // 静止状态的火柴人
    let graphics = scene.add.graphics();
    graphics.lineStyle(3, 0x000000, 1);
    
    // 头部
    graphics.strokeCircle(25, 10, 8);
    
    // 身体
    graphics.lineBetween(25, 18, 25, 35);
    
    // 手臂
    graphics.lineBetween(25, 22, 15, 30);
    graphics.lineBetween(25, 22, 35, 30);
    
    // 腿部
    graphics.lineBetween(25, 35, 15, 45);
    graphics.lineBetween(25, 35, 35, 45);
    
    graphics.generateTexture('stickman-idle', 50, 50);
    graphics.clear();
    
    // 跑步动画帧1
    graphics.lineStyle(3, 0x000000, 1);
    graphics.strokeCircle(25, 10, 8);
    graphics.lineBetween(25, 18, 25, 35);
    graphics.lineBetween(25, 22, 15, 30);
    graphics.lineBetween(25, 22, 35, 15);
    graphics.lineBetween(25, 35, 15, 30);
    graphics.lineBetween(25, 35, 35, 45);
    graphics.generateTexture('stickman-run1', 50, 50);
    graphics.clear();
    
    // 跑步动画帧2
    graphics.lineStyle(3, 0x000000, 1);
    graphics.strokeCircle(25, 10, 8);
    graphics.lineBetween(25, 18, 25, 35);
    graphics.lineBetween(25, 22, 15, 15);
    graphics.lineBetween(25, 22, 35, 30);
    graphics.lineBetween(25, 35, 15, 45);
    graphics.lineBetween(25, 35, 35, 30);
    graphics.generateTexture('stickman-run2', 50, 50);
    graphics.clear();
    
    // 跳跃动画
    graphics.lineStyle(3, 0x000000, 1);
    graphics.strokeCircle(25, 10, 8);
    graphics.lineBetween(25, 18, 25, 35);
    graphics.lineBetween(25, 22, 15, 15);
    graphics.lineBetween(25, 22, 35, 15);
    graphics.lineBetween(25, 35, 15, 45);
    graphics.lineBetween(25, 35, 35, 45);
    graphics.generateTexture('stickman-jump', 50, 50);
    graphics.clear();
    
    // 攻击动画
    graphics.lineStyle(3, 0x000000, 1);
    graphics.strokeCircle(25, 10, 8);
    graphics.lineBetween(25, 18, 25, 35);
    graphics.lineBetween(25, 22, 10, 22); // 出拳的手臂
    graphics.lineBetween(25, 22, 35, 30);
    graphics.lineBetween(25, 35, 15, 45);
    graphics.lineBetween(25, 35, 35, 45);
    graphics.generateTexture('stickman-attack', 50, 50);
    graphics.destroy();
}

// 创建敌人纹理
function createEnemyTexture(scene) {
    let graphics = scene.add.graphics();
    graphics.lineStyle(3, 0xFF0000, 1);
    
    // 头部
    graphics.strokeCircle(25, 10, 8);
    
    // 身体
    graphics.lineBetween(25, 18, 25, 35);
    
    // 手臂
    graphics.lineBetween(25, 22, 15, 30);
    graphics.lineBetween(25, 22, 35, 30);
    
    // 腿部
    graphics.lineBetween(25, 35, 15, 45);
    graphics.lineBetween(25, 35, 35, 45);
    
    graphics.generateTexture('enemy', 50, 50);
    graphics.destroy();
}

// 创建游戏场景
function create() {
    // 创建背景
    this.add.image(400, 300, 'sky');
    
    // 加载音效
    jumpSound = this.sound.add('jump');
    coinSound = this.sound.add('coin');
    
    // 创建平台组
    platforms = this.physics.add.staticGroup();
    
    // 创建地面
    platforms.create(400, 580, 'ground').setScale(2).refreshBody();
    
    // 创建平台
    platforms.create(600, 450, 'ground');
    platforms.create(50, 350, 'ground');
    platforms.create(750, 320, 'ground');
    platforms.create(400, 240, 'ground');
    platforms.create(100, 150, 'ground');
    
    // 创建终点线
    finishLine = this.physics.add.sprite(750, 280, 'flag');
    finishLine.setImmovable(true);
    
    // 创建玩家
    player = this.physics.add.sprite(100, 500, 'stickman-idle');
    player.setBounce(0.1);
    player.setCollideWorldBounds(true);
    player.body.setSize(20, 45);
    player.body.setOffset(15, 5);
    
    // 玩家动画
    this.anims.create({
        key: 'run',
        frames: [
            { key: 'stickman-run1' },
            { key: 'stickman-run2' }
        ],
        frameRate: 8,
        repeat: -1
    });
    
    this.anims.create({
        key: 'idle',
        frames: [{ key: 'stickman-idle' }],
        frameRate: 10
    });
    
    this.anims.create({
        key: 'jump',
        frames: [{ key: 'stickman-jump' }],
        frameRate: 10
    });
    
    this.anims.create({
        key: 'attack',
        frames: [{ key: 'stickman-attack' }],
        frameRate: 10,
        duration: 300
    });
    
    // 创建敌人组
    enemies = this.physics.add.group();
    
    // 添加几个敌人
    createEnemy(300, 535, 200, 400);
    createEnemy(600, 405, 500, 700);
    createEnemy(400, 195, 300, 500);
    
    // 创建金币组
    coins = this.physics.add.group({
        key: 'coin',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });
    
    coins.children.iterate(function (child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.2, 0.4));
        child.setScale(0.5);
    });
    
    // 添加分数和生命值文本
    scoreText = this.add.text(16, 16, '分数: 0', { fontSize: '32px', fill: '#fff' });
    livesText = this.add.text(16, 50, '生命: 3', { fontSize: '32px', fill: '#fff' });
    
    // 碰撞检测
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(coins, platforms);
    this.physics.add.collider(enemies, platforms);
    
    // 重叠检测
    this.physics.add.overlap(player, coins, collectCoin, null, this);
    this.physics.add.overlap(player, enemies, hitEnemy, null, this);
    this.physics.add.overlap(player, finishLine, reachFinish, null, this);
    
    // 键盘控制
    cursors = this.input.keyboard.createCursorKeys();
    attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 玩家攻击状态
    player.isAttacking = false;
    
    // 游戏结束处理
    this.events.on('gameOver', function() {
        document.getElementById('final-score').textContent = score;
        document.getElementById('game-over').classList.remove('hidden');
    });
}

// 创建敌人函数
function createEnemy(x, y, leftBound, rightBound) {
    const enemy = enemies.create(x, y, 'enemy');
    enemy.setBounce(0.1);
    enemy.setCollideWorldBounds(true);
    enemy.body.setSize(20, 45);
    enemy.body.setOffset(15, 5);
    enemy.leftBound = leftBound;
    enemy.rightBound = rightBound;
    enemy.direction = 'right';
    enemy.setVelocityX(100);
}

// 游戏更新循环
function update() {
    if (gameOver) {
        return;
    }
    
    // 玩家控制
    if (cursors.left.isDown) {
        player.setVelocityX(-200);
        if (playerDirection !== 'left') {
            player.setFlipX(true);
            playerDirection = 'left';
        }
        if (player.body.touching.down && !player.isAttacking) {
            player.anims.play('run', true);
        }
    } else if (cursors.right.isDown) {
        player.setVelocityX(200);
        if (playerDirection !== 'right') {
            player.setFlipX(false);
            playerDirection = 'right';
        }
        if (player.body.touching.down && !player.isAttacking) {
            player.anims.play('run', true);
        }
    } else {
        player.setVelocityX(0);
        if (player.body.touching.down && !player.isAttacking) {
            player.anims.play('idle');
        }
    }
    
    // 跳跃
    if (cursors.up.isDown && player.body.touching.down && !player.isAttacking) {
        player.setVelocityY(-500);
        player.anims.play('jump');
        jumpSound.play();
    }
    
    // 攻击
    if (Phaser.Input.Keyboard.JustDown(attackKey) && !player.isAttacking) {
        player.isAttacking = true;
        player.anims.play('attack');
        
        // 攻击区域 - 根据玩家朝向决定
        let attackX = playerDirection === 'right' ? player.x + 30 : player.x - 30;
        
        // 检查是否有敌人在攻击范围内
        enemies.children.iterate(function (enemy) {
            if (enemy.active && Phaser.Math.Distance.Between(attackX, player.y, enemy.x, enemy.y) < 40) {
                enemy.destroy();
                score += 20;
                scoreText.setText('分数: ' + score);
            }
        });
        
        // 攻击动画结束后重置攻击状态
        this.time.delayedCall(300, function() {
            player.isAttacking = false;
        });
    }
    
    // 敌人AI
    enemies.children.iterate(function (enemy) {
        if (enemy && enemy.active) {
            if (enemy.x >= enemy.rightBound) {
                enemy.setVelocityX(-100);
                enemy.direction = 'left';
                enemy.setFlipX(true);
            } else if (enemy.x <= enemy.leftBound) {
                enemy.setVelocityX(100);
                enemy.direction = 'right';
                enemy.setFlipX(false);
            }
        }
    });
}

// 收集金币
function collectCoin(player, coin) {
    coin.disableBody(true, true);
    
    // 播放音效
    coinSound.play();
    
    // 增加分数
    score += 10;
    scoreText.setText('分数: ' + score);
}

// 撞到敌人
function hitEnemy(player, enemy) {
    if (player.isAttacking) {
        enemy.destroy();
        score += 20;
        scoreText.setText('分数: ' + score);
    } else {
        // 玩家被击中，失去一条命
        lives--;
        livesText.setText('生命: ' + lives);
        
        // 短暂无敌时间
        player.setTint(0xff0000);
        this.time.delayedCall(1000, function() {
            player.clearTint();
        });
        
        if (lives <= 0) {
            gameOver = true;
            player.setTint(0xff0000);
            player.anims.play('idle');
            this.physics.pause();
            this.events.emit('gameOver');
        }
    }
}

// 到达终点
function reachFinish(player, flag) {
    gameOver = true;
    this.physics.pause();
    
    player.setTint(0x00ff00);
    player.anims.play('idle');
    
    // 奖励完成关卡的分数
    score += 100;
    scoreText.setText('分数: ' + score);
    
    this.events.emit('gameOver');
}

// UI事件监听
document.getElementById('restart-game').addEventListener('click', function() {
    document.getElementById('game-over').classList.add('hidden');
    restartGame();
});

document.getElementById('save-score').addEventListener('click', function() {
    const playerName = document.getElementById('player-name').value.trim();
    if (playerName) {
        saveScore(playerName, score);
    } else {
        alert('请输入你的名字');
    }
});

document.getElementById('view-high-scores').addEventListener('click', function() {
    document.getElementById('game-over').classList.add('hidden');
    fetchHighScores();
});

document.getElementById('close-scores').addEventListener('click', function() {
    document.getElementById('high-scores').classList.add('hidden');
    if (gameOver) {
        document.getElementById('game-over').classList.remove('hidden');
    }
});

// 重启游戏
function restartGame() {
    score = 0;
    lives = 3;
    gameOver = false;
    game.scene.getScene('default').scene.restart();
}

// 保存得分
async function saveScore(playerName, score) {
    try {
        const response = await fetch('/api/score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ player_name: playerName, score: score })
        });
        
        if (response.ok) {
            fetchHighScores();
        } else {
            alert('保存分数失败');
        }
    } catch (error) {
        console.error('保存分数错误:', error);
        alert('保存分数时出错');
    }
}

// 获取高分
async function fetchHighScores() {
    try {
        const response = await fetch('/api/score');
        if (response.ok) {
            const scores = await response.json();
            displayHighScores(scores);
        } else {
            alert('获取高分失败');
        }
    } catch (error) {
        console.error('获取高分错误:', error);
        alert('获取高分时出错');
    }
}

// 显示高分榜
function displayHighScores(scores) {
    const scoresList = document.getElementById('scores-list');
    scoresList.innerHTML = '';
    
    if (scores.length === 0) {
        scoresList.innerHTML = '<p>暂无记录</p>';
        return;
    }
    
    scores.forEach((score, index) => {
        const scoreItem = document.createElement('div');
        scoreItem.className = 'score-item';
        scoreItem.innerHTML = `
            <span><span class="score-rank">#${index + 1}</span> ${score.player_name}</span>
            <span>${score.score}</span>
        `;
        scoresList.appendChild(scoreItem);
    });
    
    document.getElementById('high-scores').classList.remove('hidden');
} 