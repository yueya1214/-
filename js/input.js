export class InputHandler {
    constructor() {
        this.keys = {};
        this.keyHistory = []; // 记录按键历史
        this.jumpPressed = false; // 跳跃键按下的状态
        this.jumpReleased = true; // 跳跃键是否已释放
        this.keyPressTime = {}; // 记录各按键按下的时间
        
        // 处理按键按下
        window.addEventListener('keydown', (e) => {
            // 防止空格键滚动页面
            if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                e.preventDefault();
            }
            
            // 记录按键状态和时间
            if (!this.keys[e.key]) {
                this.keyPressTime[e.key] = Date.now();
                
                // 添加到历史记录
                this.keyHistory.push({
                    key: e.key,
                    type: 'down',
                    time: Date.now()
                });
                
                // 保持历史记录在合理大小
                if (this.keyHistory.length > 10) {
                    this.keyHistory.shift();
                }
            }
            
            this.keys[e.key] = true;
            
            // 特殊处理空格键（跳跃）状态
            if (e.key === ' ') {
                if (this.jumpReleased) {
                    this.jumpPressed = true;
                    this.jumpReleased = false;
                }
            }
            
            console.log("按下按键: ", e.key); // 调试输出
        });
        
        // 处理按键释放
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
            
            // 清除按键时间
            delete this.keyPressTime[e.key];
            
            // 添加到历史记录
            this.keyHistory.push({
                key: e.key,
                type: 'up',
                time: Date.now()
            });
            
            // 特殊处理空格键（跳跃）状态
            if (e.key === ' ') {
                this.jumpPressed = false;
                this.jumpReleased = true;
            }
            
            console.log("释放按键: ", e.key); // 调试输出
        });
        
        // 处理失去焦点事件 - 清除所有按键
        window.addEventListener('blur', () => {
            this.clearAllKeys();
        });
        
        console.log("输入处理器已初始化");
    }
    
    // 检查按键是否刚刚按下
    isKeyJustPressed(key) {
        // 判断一个按键是否刚刚被按下 (100ms内)
        if (this.keys[key] && this.keyPressTime[key]) {
            return (Date.now() - this.keyPressTime[key]) < 100;
        }
        return false;
    }
    
    // 检查按键是否长按
    isKeyHeld(key, duration = 500) {
        // 判断一个按键是否被长按
        if (this.keys[key] && this.keyPressTime[key]) {
            return (Date.now() - this.keyPressTime[key]) >= duration;
        }
        return false;
    }
    
    // 检查特定的按键组合
    checkCombo(combo) {
        // 例如 checkCombo(['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown'])
        if (this.keyHistory.length < combo.length) return false;
        
        // 检查最近的n个按键是否匹配combo
        const recentKeys = this.keyHistory.slice(-combo.length);
        for (let i = 0; i < combo.length; i++) {
            if (recentKeys[i].key !== combo[i] || recentKeys[i].type !== 'down') {
                return false;
            }
        }
        return true;
    }
    
    // 清除所有按键状态
    clearAllKeys() {
        this.keys = {};
        this.keyPressTime = {};
        this.jumpPressed = false;
        this.jumpReleased = true;
    }
} 