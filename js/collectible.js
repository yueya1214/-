export class CollectibleItem {
    constructor(x, y, type, game) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.type = type; // 'coin', 'health', 'energy', 'key', 'star'
        this.width = 20;
        this.height = 20;
        this.points = 10;
        this.bobAmplitude = 5; // 上下漂浮的幅度
        this.bobFrequency = 0.05; // 漂浮的频率
        this.bobOffset = Math.random() * Math.PI * 2; // 随机初始相位
        this.rotation = 0;
        this.rotationSpeed = 0.05;
        this.scale = 1;
        this.pulsateSpeed = 0.02;
        this.pulsateDirection = 1;
        
        // 根据类型初始化属性
        this.initByType();
    }
    
    initByType() {
        switch(this.type) {
            case 'coin':
                this.color = '#ffcc00';
                this.points = 10;
                this.rotationSpeed = 0.1;
                break;
                
            case 'health':
                this.color = '#ff3333';
                this.points = 5;
                this.pulsateSpeed = 0.03;
                break;
                
            case 'energy':
                this.color = '#3399ff';
                this.points = 5;
                this.rotationSpeed = 0.03;
                break;
                
            case 'key':
                this.color = '#ffaa00';
                this.points = 20;
                this.width = 15;
                this.height = 25;
                break;
                
            case 'star':
                this.color = '#ffff00';
                this.points = 50;
                this.rotationSpeed = 0.15;
                this.pulsateSpeed = 0.04;
                break;
                
            default:
                this.color = '#ffffff';
                this.points = 10;
        }
    }
    
    update() {
        // 上下漂浮效果
        this.y = this.y + Math.sin((this.game.lastTime * this.bobFrequency) + this.bobOffset) * 0.5;
        
        // 旋转效果
        this.rotation += this.rotationSpeed;
        
        // 脉动效果
        this.scale += this.pulsateSpeed * this.pulsateDirection;
        if (this.scale > 1.2) {
            this.pulsateDirection = -1;
        } else if (this.scale < 0.8) {
            this.pulsateDirection = 1;
        }
    }
    
    draw(ctx) {
        ctx.save();
        
        // 设置旋转和缩放的原点为物体中心
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation);
        ctx.scale(this.scale, this.scale);
        
        // 根据收集物类型绘制不同图形
        switch(this.type) {
            case 'coin':
                this.drawCoin(ctx);
                break;
                
            case 'health':
                this.drawHealth(ctx);
                break;
                
            case 'energy':
                this.drawEnergy(ctx);
                break;
                
            case 'key':
                this.drawKey(ctx);
                break;
                
            case 'star':
                this.drawStar(ctx);
                break;
                
            default:
                this.drawGeneric(ctx);
        }
        
        ctx.restore();
    }
    
    drawCoin(ctx) {
        // 绘制金币
        const radius = this.width / 2;
        
        // 外环
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        
        // 内环
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = '#ffd700'; // 金色
        ctx.fill();
        
        // C标志 (表示Coin)
        ctx.fillStyle = '#996600';
        ctx.font = `${radius}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('C', 0, 0);
    }
    
    drawHealth(ctx) {
        // 绘制红心
        const size = this.width / 2;
        
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(0, size * 0.3);
        ctx.bezierCurveTo(size * 0.3, -size * 0.4, size, size * 0.3, 0, size);
        ctx.bezierCurveTo(-size, size * 0.3, -size * 0.3, -size * 0.4, 0, size * 0.3);
        ctx.closePath();
        ctx.fill();
    }
    
    drawEnergy(ctx) {
        // 绘制能量
        const size = this.width / 2;
        
        // 闪电形状
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(-size * 0.2, -size);
        ctx.lineTo(size * 0.5, -size * 0.2);
        ctx.lineTo(0, size * 0.2);
        ctx.lineTo(size * 0.7, size);
        ctx.lineTo(size * 0.2, 0);
        ctx.lineTo(size * 0.5, -size * 0.5);
        ctx.closePath();
        ctx.fill();
        
        // 发光效果
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(51, 153, 255, 0.3)';
        ctx.fill();
    }
    
    drawKey(ctx) {
        // 绘制钥匙
        const width = this.width * 0.6;
        const height = this.height * 0.6;
        
        // 钥匙头
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, -height/3, width/2, 0, Math.PI * 2);
        ctx.fill();
        
        // 钥匙柄
        ctx.fillRect(-width/6, -height/6, width/3, height*0.7);
        
        // 钥匙齿
        ctx.fillRect(0, height/4, width/2, height/6);
        ctx.fillRect(width/4, height/3, width/6, height/6);
    }
    
    drawStar(ctx) {
        // 绘制星星
        const size = this.width / 2;
        const spikes = 5;
        const outerRadius = size;
        const innerRadius = size / 2;
        
        ctx.beginPath();
        ctx.moveTo(0, -outerRadius);
        
        for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (Math.PI / spikes) * i;
            const x = Math.sin(angle) * radius;
            const y = -Math.cos(angle) * radius;
            ctx.lineTo(x, y);
        }
        
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();
        
        // 发光效果
        ctx.beginPath();
        ctx.arc(0, 0, outerRadius * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
        ctx.fill();
    }
    
    drawGeneric(ctx) {
        // 绘制通用收集物
        const radius = this.width / 2;
        
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fill();
    }
} 