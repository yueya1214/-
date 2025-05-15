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
        
        // 创建缓存画布
        this.createCacheCanvas();
    }
    
    // 创建缓存画布，预渲染平台
    createCacheCanvas() {
        // 确保宽度和高度都大于0
        if (this.width <= 0 || this.height <= 0) {
            console.error("无法创建缓存画布：宽度或高度为0", this.width, this.height);
            return;
        }
        
        try {
            this.cacheCanvas = document.createElement('canvas');
            this.cacheCanvas.width = Math.max(1, this.width);  // 确保至少为1像素
            this.cacheCanvas.height = Math.max(1, this.height); // 确保至少为1像素
            this.cacheCtx = this.cacheCanvas.getContext('2d');
            
            // 预渲染平台到缓存画布
            this.renderToCache();
        } catch (error) {
            console.error("创建缓存画布时出错:", error.message);
        }
    }
    
    // 更新平台尺寸或类型时重新渲染缓存
    updateCache() {
        if (this.cacheCanvas) {
            // 更新缓存画布大小
            this.cacheCanvas.width = this.width;
            this.cacheCanvas.height = this.height;
            
            // 重新渲染到缓存
            this.renderToCache();
        }
    }
    
    // 渲染平台到缓存画布
    renderToCache() {
        const ctx = this.cacheCtx;
        const fillColor = this.colors[this.type] || this.colors.normal;
        
        // 清除缓存画布
        ctx.clearRect(0, 0, this.width, this.height);
        
        // 绘制平台主体
        ctx.fillStyle = fillColor;
        ctx.fillRect(0, 0, this.width, this.height);
        
        // 根据平台类型添加装饰
        switch (this.type) {
            case 'grass':
                this.drawGrassPlatformToCache(ctx);
                break;
            case 'metal':
                this.drawMetalPlatformToCache(ctx);
                break;
            case 'stone':
                this.drawStonePlatformToCache(ctx);
                break;
            case 'wood':
                this.drawWoodPlatformToCache(ctx);
                break;
            case 'ice':
                this.drawIcePlatformToCache(ctx);
                break;
        }
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
        // 使用缓存画布直接绘制 - 先检查缓存画布是否有效
        if (this.cacheCanvas && this.cacheCanvas.width > 0 && this.cacheCanvas.height > 0) {
            try {
                ctx.drawImage(this.cacheCanvas, this.x, this.y);
            } catch (error) {
                console.error("平台绘制错误:", error.message);
                console.log("平台信息:", this.x, this.y, this.width, this.height, this.type);
                console.log("缓存画布:", this.cacheCanvas.width, this.cacheCanvas.height);
                
                // 出错时使用备用方法绘制
                ctx.fillStyle = this.colors[this.type] || this.colors.normal;
                ctx.fillRect(this.x, this.y, this.width, this.height);
            }
        } else {
            // 如果缓存画布无效，则直接绘制
            ctx.fillStyle = this.colors[this.type] || this.colors.normal;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // 尝试重新创建缓存画布
            if (!this.cacheCanvas || this.cacheCanvas.width === 0 || this.cacheCanvas.height === 0) {
                console.log("尝试重新创建平台缓存画布");
                this.createCacheCanvas();
            }
        }
    }
    
    // 不同类型平台的绘制方法 - 缓存版本
    drawGrassPlatformToCache(ctx) {
        // 顶部草
        ctx.fillStyle = '#4da83a';
        ctx.fillRect(0, 0, this.width, 10);
        
        // 草细节 - 使用固定随机值而不是每次生成随机数
        ctx.fillStyle = '#66c858';
        for (let i = 0; i < this.width; i += 15) {
            // 使用确定性的伪随机值
            const grassHeight = 5 + ((i * 3) % 5);
            ctx.fillRect(i, -grassHeight, 3, grassHeight);
        }
    }
    
    drawMetalPlatformToCache(ctx) {
        // 金属平台边缘
        ctx.fillStyle = '#999';
        ctx.fillRect(0, 0, this.width, 5);
        
        // 金属螺栓 - 以更固定的方式绘制
        ctx.fillStyle = '#555';
        for (let i = 10; i < this.width; i += 30) {
            ctx.beginPath();
            ctx.arc(i, 10, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    drawStonePlatformToCache(ctx) {
        // 石块纹理
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 1;
        
        // 水平线 - 每20像素一条
        const hLines = Math.floor(this.height / 20);
        for (let i = 0; i < hLines; i++) {
            const y = i * 20;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.width, y);
            ctx.stroke();
        }
        
        // 垂直线 - 每40像素一条
        const vLines = Math.floor(this.width / 40);
        for (let i = 0; i < vLines; i++) {
            const x = i * 40;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.height);
            ctx.stroke();
        }
    }
    
    drawWoodPlatformToCache(ctx) {
        // 木纹理
        ctx.fillStyle = '#9b6c3b';
        
        // 木板条纹
        const planks = Math.floor(this.width / 20);
        for (let i = 0; i < planks; i++) {
            const x = i * 20;
            ctx.fillRect(x, 0, 15, this.height);
        }
        
        // 木板纹理线
        ctx.strokeStyle = '#6b4c2a';
        ctx.lineWidth = 1;
        
        // 每块木板上的纹理线
        for (let i = 0; i < planks; i++) {
            const x = i * 20;
            // 每10像素高度一条线
            const lines = Math.floor(this.height / 10);
            for (let j = 0; j < lines; j++) {
                const y = j * 10 + 5;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + 15, y);
                ctx.stroke();
            }
        }
    }
    
    drawIcePlatformToCache(ctx) {
        // 冰面反光效果
        const gradient = ctx.createLinearGradient(
            0, 0, 
            0, this.height
        );
        
        gradient.addColorStop(0, '#c9f0ff');
        gradient.addColorStop(0.5, '#add8e6');
        gradient.addColorStop(1, '#88c5d5');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.height);
        
        // 冰晶效果 - 使用固定模式而不是随机位置
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.3;
        
        // 固定5个冰晶位置
        const icePositions = [
            {x: this.width * 0.2, y: this.height * 0.3, size: 3},
            {x: this.width * 0.5, y: this.height * 0.2, size: 5},
            {x: this.width * 0.8, y: this.height * 0.4, size: 4},
            {x: this.width * 0.3, y: this.height * 0.7, size: 3},
            {x: this.width * 0.7, y: this.height * 0.8, size: 4}
        ];
        
        for (const pos of icePositions) {
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, pos.size, 0, Math.PI * 2);
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