# 火柴人大冒险 - 横板闯关游戏

一个基于Phaser.js的2D横板闯关游戏，玩家需要控制火柴人角色收集金币、躲避或攻击敌人，最终到达终点。游戏支持高分记录，使用Cloudflare Pages和D1数据库部署。

## 游戏特性

- 简单直观的控制：方向键移动，空格键攻击
- 收集金币获得分数
- 击败敌人获得更多分数
- 三条生命值系统
- 独特的游戏音效和粒子效果
- 高分榜系统保存玩家成绩

## 本地开发

要在本地运行此项目，请按照以下步骤操作：

1. 克隆项目到本地：
   ```
   git clone <repository-url>
   cd stickman-platformer
   ```

2. 安装Wrangler CLI工具（用于Cloudflare Pages和D1数据库）：
   ```
   npm install -g wrangler
   ```

3. 创建D1数据库（需要Cloudflare账户）：
   ```
   wrangler d1 create stickman_scores
   ```

4. 使用以下SQL创建scores表：
   ```
   wrangler d1 execute stickman_scores --command "CREATE TABLE scores (id INTEGER PRIMARY KEY AUTOINCREMENT, player_name TEXT NOT NULL, score INTEGER NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);"
   ```

5. 更新wrangler.toml中的数据库ID（在上一步创建数据库后，你将收到一个数据库ID）：
   ```toml
   database_id = "你的数据库ID在这里"
   ```

6. 使用Wrangler启动本地开发服务器：
   ```
   wrangler pages dev
   ```

## 部署到Cloudflare Pages

1. 推送你的代码到GitHub仓库

2. 在Cloudflare Dashboard中，转到Pages并创建一个新项目

3. 连接你的GitHub仓库并配置以下设置：
   - 构建命令: `echo 'No build required'`  
   - 输出目录: `./` (或者你的静态文件所在的目录)

4. 在"环境变量"部分，添加D1数据库绑定：
   - 变量名: `SCORES_DB`
   - 值: 选择你创建的`stickman_scores`数据库

5. 部署你的项目

## 技术栈

- **前端**：HTML, CSS, JavaScript
- **游戏引擎**：Phaser 3
- **后端**：Cloudflare Pages Functions
- **数据库**：Cloudflare D1 (SQLite)

## 游戏控制

- **←/→ 方向键**：左右移动
- **↑ 方向键**：跳跃
- **空格键**：攻击

## 游戏目标

1. 收集尽可能多的金币
2. 击败或避开敌人
3. 避开尖刺等障碍物
4. 到达关卡终点
5. 获得最高分数

## 项目结构

```
/
├── index.html           # 主HTML文件
├── style.css            # 样式文件
├── game.js              # 游戏逻辑
├── functions/           # Cloudflare Pages Functions
│   └── api/
│       └── score.js     # 高分API函数
├── wrangler.toml        # Cloudflare配置
└── README.md            # 项目说明
```

## 自定义游戏

你可以通过修改以下文件来自定义游戏：

- **game.js**：调整游戏难度、敌人行为和关卡设计
- **style.css**：修改游戏UI和外观
- **index.html**：更改游戏标题和说明文本

## 许可证

MIT

## 贡献

欢迎提交问题和改进建议！ 