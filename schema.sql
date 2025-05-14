-- 如果表已存在则删除
DROP TABLE IF EXISTS scores;

-- 创建分数表
CREATE TABLE scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_name TEXT NOT NULL,
  score INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 添加一些测试数据
INSERT INTO scores (player_name, score) VALUES ('小明', 250);
INSERT INTO scores (player_name, score) VALUES ('小红', 320);
INSERT INTO scores (player_name, score) VALUES ('小刚', 180); 