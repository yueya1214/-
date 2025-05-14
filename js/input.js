export class InputHandler {
    constructor() {
        this.keys = {};
        
        window.addEventListener('keydown', (e) => {
            // 防止空格键滚动页面
            if (e.key === ' ') {
                e.preventDefault();
            }
            
            this.keys[e.key] = true;
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }
} 