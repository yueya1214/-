export class SoundManager {
    constructor() {
        this.sounds = {};
        this.music = null;
        this.isMuted = false;
        this.musicVolume = 0.5;
        this.soundVolume = 0.7;
        
        // 加载声音
        this.loadSounds();
    }
    
    loadSounds() {
        // 创建虚拟音频对象，实际项目中应加载真实音频文件
        // 这里只是创建一个模拟对象
        
        // 音效
        this.sounds = {
            'jump': this.createDummyAudio(),
            'attack': this.createDummyAudio(),
            'special': this.createDummyAudio(),
            'hurt': this.createDummyAudio(),
            'coin-pickup': this.createDummyAudio(),
            'health-pickup': this.createDummyAudio(),
            'energy-pickup': this.createDummyAudio(),
            'enemy-death': this.createDummyAudio(),
            'enemy-hurt': this.createDummyAudio(),
            'enemy-attack': this.createDummyAudio(),
            'robot-dash': this.createDummyAudio(),
            'shoot': this.createDummyAudio(),
            'level-complete': this.createDummyAudio(),
            'game-over': this.createDummyAudio(),
            'victory': this.createDummyAudio(),
            'level-start': this.createDummyAudio()
        };
        
        // 背景音乐
        this.music = this.createDummyAudio();
    }
    
    createDummyAudio() {
        // 创建一个模拟的音频对象
        return {
            play: () => console.log("Sound played"),
            pause: () => console.log("Sound paused"),
            currentTime: 0,
            loop: false,
            volume: 1
        };
    }
    
    playSound(name) {
        if (this.isMuted) return;
        
        const sound = this.sounds[name];
        if (sound) {
            // 重置时间以便重复播放
            sound.currentTime = 0;
            sound.volume = this.soundVolume;
            sound.play();
        }
    }
    
    playMusic(name) {
        if (this.isMuted) return;
        
        if (this.music) {
            this.music.loop = true;
            this.music.volume = this.musicVolume;
            this.music.currentTime = 0;
            this.music.play();
        }
    }
    
    pauseMusic() {
        if (this.music) {
            this.music.pause();
        }
    }
    
    resumeMusic() {
        if (!this.isMuted && this.music) {
            this.music.play();
        }
    }
    
    stopMusic() {
        if (this.music) {
            this.music.pause();
            this.music.currentTime = 0;
        }
    }
    
    toggleMute() {
        this.isMuted = !this.isMuted;
        
        if (this.isMuted) {
            // 静音所有声音
            this.pauseMusic();
        } else {
            // 恢复音乐播放
            this.resumeMusic();
        }
        
        return this.isMuted;
    }
    
    setMusicVolume(volume) {
        this.musicVolume = volume;
        if (this.music) {
            this.music.volume = volume;
        }
    }
    
    setSoundVolume(volume) {
        this.soundVolume = volume;
    }
    
    // 在实际游戏中，应该实现一个加载真实音频文件的方法
    // loadAudioFile(url) { ... }
} 