// 请求处理函数，处理来自客户端的高分请求
export async function onRequest(context) {
  // 获取请求方法和 D1 数据库绑定
  const { request, env } = context;
  const db = env.SCORES_DB;
  
  // 设置跨域头信息
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };
  
  // 处理 OPTIONS 请求（预检请求）
  if (request.method === "OPTIONS") {
    return new Response(null, { headers });
  }
  
  // 处理 GET 请求 - 获取高分
  if (request.method === "GET") {
    try {
      // 查询前10个最高分
      const result = await db.prepare(
        "SELECT id, player_name, score FROM scores ORDER BY score DESC LIMIT 10"
      ).all();
      
      return new Response(JSON.stringify(result.results), {
        headers,
        status: 200
      });
    } catch (error) {
      console.error("获取高分时出错:", error);
      
      return new Response(JSON.stringify({ error: "获取高分失败" }), {
        headers,
        status: 500
      });
    }
  }
  
  // 处理 POST 请求 - 保存高分
  if (request.method === "POST") {
    try {
      const payload = await request.json();
      
      // 简单验证
      if (!payload.player_name || typeof payload.score !== "number") {
        return new Response(JSON.stringify({ error: "无效的数据格式" }), {
          headers,
          status: 400
        });
      }
      
      // 清理名称，避免潜在的 SQL 注入风险
      const playerName = payload.player_name.slice(0, 20).replace(/[^\w\s\u4e00-\u9fa5]/g, '');
      const score = Math.max(0, Math.floor(payload.score));
      
      // 将高分保存到数据库
      const result = await db.prepare(
        "INSERT INTO scores (player_name, score) VALUES (?, ?)"
      ).bind(playerName, score).run();
      
      return new Response(JSON.stringify({ success: true, id: result.meta.last_row_id }), {
        headers,
        status: 201
      });
    } catch (error) {
      console.error("保存高分时出错:", error);
      
      return new Response(JSON.stringify({ error: "保存高分失败" }), {
        headers,
        status: 500
      });
    }
  }
  
  // 处理未知的请求方法
  return new Response(JSON.stringify({ error: "不支持的方法" }), {
    headers,
    status: 405
  });
} 