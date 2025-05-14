# 火柴人平台冒险游戏

一个基于Phaser 3的2D横向卷轴平台游戏，使用HTML, JavaScript和CSS开发，可部署在Cloudflare Pages上。游戏使用Cloudflare D1数据库存储高分记录。

## 游戏特点

- 火柴人主角，可以左右移动、跳跃和攻击
- 敌人AI，会在指定区域巡逻
- 可收集金币增加分数
- 高分记录系统
- 简单的平台关卡设计
- 使用程序化生成的图形（无需外部图像资源）

## 游戏控制

- **左右方向键**: 移动
- **上方向键**: 跳跃
- **空格键**: 攻击

## 本地开发

### 前提条件

- [Node.js](https://nodejs.org/) (推荐v16以上)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

### 安装步骤

1. 克隆项目或下载源码

2. 安装Wrangler CLI工具：

```bash
npm install -g wrangler
```

3. 登录到你的Cloudflare账户：

```bash
wrangler login
```

4. 创建D1数据库：

```bash
wrangler d1 create stick_figure_game
```

5. 记录创建的数据库ID，并更新`wrangler.toml`文件中的`database_id`字段。

6. 创建数据库表：

```bash
wrangler d1 execute stick_figure_game --file=schema.sql
```

7. 启动本地开发服务器：

```bash
wrangler pages dev --binding=DB=your-database-id
```

8. 访问http://localhost:8788 查看游戏

## 项目结构

```
/
├── index.html          # 游戏的HTML主文件
├── game.js             # 游戏的主要JavaScript代码
├── style.css           # CSS样式
├── functions/
│   └── api/
│       └── score.js    # 处理高分API的Pages Functions
├── schema.sql          # 数据库模式定义
├── wrangler.toml       # Cloudflare Wrangler配置
└── README.md           # 项目说明文档
```

## 数据库设置

创建`schema.sql`文件，内容如下：

```sql
DROP TABLE IF EXISTS scores;
CREATE TABLE scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_name TEXT NOT NULL,
  score INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 部署到Cloudflare Pages

1. 推送代码到GitHub、GitLab或Bitbucket代码仓库。

2. 在Cloudflare Pages控制台上创建新项目并关联代码仓库。

3. 选择部署分支，设置构建配置：
   - 构建命令：留空
   - 构建输出目录：`./`
   - 环境变量：根据需要配置

4. 部署完成后，需要创建和绑定D1数据库：

```bash
# 创建数据库（如果还没有创建）
wrangler d1 create stick_figure_game

# 创建数据库表
wrangler d1 execute stick_figure_game --file=schema.sql

# 绑定数据库到Pages项目
wrangler pages deployment create --binding=DB=your-database-id
```

5. 在Cloudflare Pages的"Settings">"Functions">"D1 Database Bindings"中将D1数据库绑定到`DB`。

## 优化建议

- 自定义游戏资源以减少外部依赖
- 添加更多关卡和敌人类型
- 实现移动端触控支持
- 添加音乐和更多音效
- 实现保存游戏进度的功能

## 浏览器兼容性

游戏兼容以下现代浏览器：
- Google Chrome (最新版)
- Mozilla Firefox (最新版)
- Microsoft Edge (最新版)
- Safari (最新版)

## 许可证

MIT 