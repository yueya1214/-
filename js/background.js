export class BackgroundLayer {
    constructor(x, y, width, height, color, speedModifier) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.speedModifier = speedModifier;
        this.image = null;
        this.offset = 0;
    }
    
    update(playerSpeed) {
        // 视差效果 - 背景随玩家移动而移动，但速度不同
        this.offset -= playerSpeed * this.speedModifier;
        // 循环背景
        if (this.offset < -this.width) this.offset += this.width;
        if (this.offset > this.width) this.offset -= this.width;
    }
    
    draw(ctx) {
        if (this.image) {
            // 使用图像作为背景
            // 绘制两次以确保无缝循环
            ctx.drawImage(this.image, this.x + this.offset, this.y, this.width, this.height);
            
            // 如果第一张图片移出屏幕，绘制第二张确保无缝循环
            if (this.offset < 0) {
                ctx.drawImage(this.image, this.x + this.width + this.offset, this.y, this.width, this.height);
            } else if (this.offset > 0) {
                ctx.drawImage(this.image, this.x - this.width + this.offset, this.y, this.width, this.height);
            }
        } else {
            // 使用纯色作为背景
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // 添加一些装饰元素，使背景更有趣
            this.drawDecorations(ctx);
        }
    }
    
    drawDecorations(ctx) {
        // 根据背景颜色添加不同的装饰
        if (this.color === '#87CEEB') { // 天空
            this.drawClouds(ctx);
        } else if (this.color === '#5a3921') { // 地面
            this.drawGround(ctx);
        }
    }
    
    drawClouds(ctx) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        
        // 绘制几朵云
        const cloudPositions = [
            { x: (100 + this.offset * 0.2) % this.width, y: 80, size: 40 },
            { x: (300 + this.offset * 0.1) % this.width, y: 150, size: 60 },
            { x: (600 + this.offset * 0.15) % this.width, y: 100, size: 50 }
        ];
        
        cloudPositions.forEach(cloud => {
            let x = cloud.x;
            // 循环云的位置
            if (x < 0) x += this.width;
            
            // 绘制云朵
            ctx.beginPath();
            ctx.arc(x, cloud.y, cloud.size / 2, 0, Math.PI * 2);
            ctx.arc(x + cloud.size * 0.4, cloud.y - cloud.size * 0.2, cloud.size / 2.5, 0, Math.PI * 2);
            ctx.arc(x + cloud.size * 0.8, cloud.y, cloud.size / 2, 0, Math.PI * 2);
            ctx.fill();
        });
    }
    
    drawGround(ctx) {
        // 绘制简单的地面细节
        ctx.fillStyle = '#4d3118';
        
        for (let i = 0; i < this.width; i += 40) {
            const adjustedX = (i + this.offset * 2) % this.width;
            if (adjustedX < 0) continue;
            
            // 地面纹理
            ctx.fillRect(adjustedX, this.y + 10, 20, 5);
            ctx.fillRect(adjustedX + 10, this.y + 25, 15, 5);
        }
    }
    
    // 设置背景图像
    setImage(image) {
        this.image = image;
        return this;
    }
} 