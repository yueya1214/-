export class Platform {
    constructor(x, y, width, height, type = 'normal') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;
        
        // 平台类型颜色映射
        this.colors = {
            normal: '#555',
            grass: '#3a7d2d',
            metal: '#777',
            stone: '#555',
            wood: '#8b4513',
            ice: '#add8e6'
        };
        
        // 平台特性
        this.properties = {
            ice: { friction: 0.98 },
            normal: { friction: 0.9 },
            metal: { friction: 0.85 }
        };
        
        // 获取平台特性，默认为normal
        this.friction = (this.properties[this.type] || this.properties.normal).friction;
        
        // 平台是否可以穿过（单向平台）
        this.passThrough = false;
        
        // 平台是否会移动
        this.isMoving = false;
        this.startX = x;
        this.startY = y;
        this.moveSpeed = 0;
        this.moveDistance = 0;
        this.moveDirection = 1;
        this.moveAxis = 'x'; // 'x' 或 'y'
    }
    
    update() {
        // 处理移动平台
        if (this.isMoving) {
            if (this.moveAxis === 'x') {
                this.x += this.moveSpeed * this.moveDirection;
                
                // 检查是否达到移动限制
                if (
                    Math.abs(this.x - this.startX) >= this.moveDistance
                ) {
                    this.moveDirection *= -1;
                }
            } else {
                this.y += this.moveSpeed * this.moveDirection;
                
                // 检查是否达到移动限制
                if (
                    Math.abs(this.y - this.startY) >= this.moveDistance
                ) {
                    this.moveDirection *= -1;
                }
            }
        }
    }
    
    draw(ctx) {
        const fillColor = this.colors[this.type] || this.colors.normal;
        
        // 绘制平台主体
        ctx.fillStyle = fillColor;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 根据平台类型添加装饰
        switch (this.type) {
            case 'grass':
                this.drawGrassPlatform(ctx);
                break;
            case 'metal':
                this.drawMetalPlatform(ctx);
                break;
            case 'stone':
                this.drawStonePlatform(ctx);
                break;
            case 'wood':
                this.drawWoodPlatform(ctx);
                break;
            case 'ice':
                this.drawIcePlatform(ctx);
                break;
        }
    }
    
    // 不同类型平台的绘制方法
    drawGrassPlatform(ctx) {
        // 顶部草
        ctx.fillStyle = '#4da83a';
        ctx.fillRect(this.x, this.y, this.width, 10);
        
        // 草细节
        ctx.fillStyle = '#66c858';
        for (let i = 0; i < this.width; i += 15) {
            const grassHeight = 5 + Math.random() * 5;
            ctx.fillRect(this.x + i, this.y - grassHeight, 3, grassHeight);
        }
    }
    
    drawMetalPlatform(ctx) {
        // 金属平台边缘
        ctx.fillStyle = '#999';
        ctx.fillRect(this.x, this.y, this.width, 5);
        
        // 金属螺栓
        ctx.fillStyle = '#555';
        for (let i = 10; i < this.width; i += 30) {
            ctx.beginPath();
            ctx.arc(this.x + i, this.y + 10, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    drawStonePlatform(ctx) {
        // 石块纹理
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 1;
        
        // 水平线
        for (let i = 0; i < this.height; i += 20) {
            ctx.beginPath();
            ctx.moveTo(this.x, this.y + i);
            ctx.lineTo(this.x + this.width, this.y + i);
            ctx.stroke();
        }
        
        // 垂直线，创建砖块效果
        for (let i = 0; i < this.width; i += 40) {
            ctx.beginPath();
            ctx.moveTo(this.x + i, this.y);
            ctx.lineTo(this.x + i, this.y + this.height);
            ctx.stroke();
        }
    }
    
    drawWoodPlatform(ctx) {
        // 木纹理
        ctx.fillStyle = '#9b6c3b';
        
        // 木板条纹
        for (let i = 0; i < this.width; i += 20) {
            ctx.fillRect(this.x + i, this.y, 15, this.height);
        }
        
        // 木板纹理线
        ctx.strokeStyle = '#6b4c2a';
        ctx.lineWidth = 1;
        
        for (let i = 0; i < this.width; i += 20) {
            // 水平线
            for (let j = 5; j < this.height; j += 10) {
                ctx.beginPath();
                ctx.moveTo(this.x + i, this.y + j);
                ctx.lineTo(this.x + i + 15, this.y + j);
                ctx.stroke();
            }
        }
    }
    
    drawIcePlatform(ctx) {
        // 冰面反光效果
        const gradient = ctx.createLinearGradient(
            this.x, this.y, 
            this.x, this.y + this.height
        );
        
        gradient.addColorStop(0, '#c9f0ff');
        gradient.addColorStop(0.5, '#add8e6');
        gradient.addColorStop(1, '#88c5d5');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 冰晶效果
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.3;
        
        for (let i = 0; i < 5; i++) {
            const x = this.x + Math.random() * this.width;
            const y = this.y + Math.random() * this.height;
            const size = 2 + Math.random() * 4;
            
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.globalAlpha = 1;
    }
    
    // 创建一个移动平台
    setMoving(speed, distance, axis = 'x') {
        this.isMoving = true;
        this.moveSpeed = speed;
        this.moveDistance = distance;
        this.moveAxis = axis;
        return this;
    }
    
    // 设置为单向平台（可以从下方穿过）
    setPassThrough() {
        this.passThrough = true;
        return this;
    }
} 