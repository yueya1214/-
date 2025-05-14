// 处理API请求的函数
export async function onRequest(context) {
  // 获取请求对象和环境变量
  const { request, env } = context;
  
  // 获取请求方法
  const method = request.method;

  try {
    // 根据HTTP方法处理不同的请求类型
    if (method === "GET") {
      // 获取高分列表
      return await getHighScores(env);
    } else if (method === "POST") {
      // 保存新高分
      return await saveScore(request, env);
    } else {
      // 不支持的HTTP方法
      return new Response(JSON.stringify({ error: "不支持的方法" }), {
        status: 405,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
  } catch (error) {
    // 错误处理
    console.error("API错误:", error);
    return new Response(JSON.stringify({ error: "服务器内部错误" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
}

// 获取高分列表
async function getHighScores(env) {
  // 查询数据库中的高分记录，按分数降序排列，限制10条
  const { results } = await env.DB.prepare(
    "SELECT id, player_name, score FROM scores ORDER BY score DESC LIMIT 10"
  ).all();

  // 返回高分列表的JSON响应
  return new Response(JSON.stringify(results), {
    headers: {
      "Content-Type": "application/json"
    }
  });
}

// 保存新的高分记录
async function saveScore(request, env) {
  // 解析请求体中的JSON数据
  const data = await request.json();
  
  // 验证请求数据
  if (!data.player_name || typeof data.score !== "number") {
    return new Response(JSON.stringify({ error: "无效的数据格式" }), {
      status: 400,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }

  // 清理和验证玩家名称，避免SQL注入
  const playerName = data.player_name.trim().substring(0, 50);
  
  // 验证分数是否为正整数
  const score = Math.max(0, Math.floor(data.score));

  try {
    // 将高分记录插入数据库
    const { success } = await env.DB.prepare(
      "INSERT INTO scores (player_name, score) VALUES (?, ?)"
    )
    .bind(playerName, score)
    .run();

    if (success) {
      return new Response(JSON.stringify({ message: "分数保存成功" }), {
        status: 201,
        headers: {
          "Content-Type": "application/json"
        }
      });
    } else {
      throw new Error("数据库操作失败");
    }
  } catch (error) {
    console.error("保存分数错误:", error);
    return new Response(JSON.stringify({ error: "保存分数失败" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
} 