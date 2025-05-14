export class InputHandler {
    constructor() {
        this.keys = {};
        
        window.addEventListener('keydown', (e) => {
            // 防止空格键滚动页面
            if (e.key === ' ') {
                e.preventDefault();
            }
            
            this.keys[e.key] = true;
            console.log("按下按键: ", e.key); // 调试输出
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
        
        console.log("输入处理器已初始化");
    }
} 