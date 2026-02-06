// Vercel Serverless Function for Annotations API
// 使用 Vercel KV (Upstash Redis) 存储批注数据

const ANNOTATIONS_KEY = 'prd_annotations';
const META_KEY = 'prd_annotations_meta';

// 动态检查 KV 是否可用
let kv = null;
let kvAvailable = false;

const initKV = async () => {
  if (kv !== null) return kvAvailable;
  
  // 检查环境变量是否存在（支持默认 KV_ 前缀和自定义 STORAGE_ 前缀）
  const hasDefaultKV = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;
  const hasStorageKV = process.env.STORAGE_REST_API_URL && process.env.STORAGE_REST_API_TOKEN;
  
  if (!hasDefaultKV && !hasStorageKV) {
    console.warn('Vercel KV 环境变量未配置');
    kvAvailable = false;
    return false;
  }
  
  // 如果使用 STORAGE_ 前缀，需要设置别名
  if (!hasDefaultKV && hasStorageKV) {
    process.env.KV_REST_API_URL = process.env.STORAGE_REST_API_URL;
    process.env.KV_REST_API_TOKEN = process.env.STORAGE_REST_API_TOKEN;
    process.env.KV_REST_API_READ_ONLY_TOKEN = process.env.STORAGE_REST_API_READ_ONLY_TOKEN;
    process.env.KV_URL = process.env.STORAGE_URL;
  }
  
  try {
    const kvModule = await import('@vercel/kv');
    kv = kvModule.kv;
    kvAvailable = true;
    return true;
  } catch (error) {
    console.error('Failed to initialize KV:', error);
    kvAvailable = false;
    return false;
  }
};

// CORS 头部设置
const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

// 生成唯一 ID
const generateId = () => {
  return `ann_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// 获取所有批注
const getAnnotations = async () => {
  if (!kvAvailable) return [];
  
  try {
    const annotations = await kv.hgetall(ANNOTATIONS_KEY);
    if (!annotations) return [];
    
    // 转换为数组并解析日期
    return Object.values(annotations).map(ann => ({
      ...ann,
      createdAt: ann.createdAt,
      updatedAt: ann.updatedAt || null,
      replies: ann.replies || [],
    }));
  } catch (error) {
    console.error('Error getting annotations:', error);
    return [];
  }
};

// 获取元数据（最后更新时间）
const getMeta = async () => {
  if (!kvAvailable) return { lastUpdated: 0 };
  
  try {
    const meta = await kv.hgetall(META_KEY);
    return meta || { lastUpdated: 0 };
  } catch (error) {
    return { lastUpdated: 0 };
  }
};

// 更新元数据
const updateMeta = async () => {
  if (!kvAvailable) return;
  
  try {
    await kv.hset(META_KEY, { lastUpdated: Date.now() });
  } catch (error) {
    console.error('Error updating meta:', error);
  }
};

// 创建批注
const createAnnotation = async (data) => {
  if (!kvAvailable) {
    throw new Error('KV_NOT_CONFIGURED');
  }
  
  const annotation = {
    id: generateId(),
    targetId: data.targetId,
    content: data.content || '',
    author: data.author || '匿名用户',
    authorId: data.authorId || generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: null,
    resolved: false,
    position: data.position || { x: 50, y: 50 },
    replies: [],
  };
  
  try {
    await kv.hset(ANNOTATIONS_KEY, { [annotation.id]: annotation });
    await updateMeta();
    return annotation;
  } catch (error) {
    console.error('Error creating annotation:', error);
    throw error;
  }
};

// 更新批注
const updateAnnotation = async (id, updates) => {
  if (!kvAvailable) {
    throw new Error('KV_NOT_CONFIGURED');
  }
  
  try {
    const existing = await kv.hget(ANNOTATIONS_KEY, id);
    if (!existing) {
      throw new Error('Annotation not found');
    }
    
    const updated = {
      ...existing,
      ...updates,
      id: existing.id, // 保持 ID 不变
      createdAt: existing.createdAt, // 保持创建时间不变
      updatedAt: new Date().toISOString(),
    };
    
    await kv.hset(ANNOTATIONS_KEY, { [id]: updated });
    await updateMeta();
    return updated;
  } catch (error) {
    console.error('Error updating annotation:', error);
    throw error;
  }
};

// 删除批注
const deleteAnnotation = async (id) => {
  if (!kvAvailable) {
    throw new Error('KV_NOT_CONFIGURED');
  }
  
  try {
    await kv.hdel(ANNOTATIONS_KEY, id);
    await updateMeta();
    return { success: true };
  } catch (error) {
    console.error('Error deleting annotation:', error);
    throw error;
  }
};

// 添加回复
const addReply = async (annotationId, replyData) => {
  if (!kvAvailable) {
    throw new Error('KV_NOT_CONFIGURED');
  }
  
  try {
    const existing = await kv.hget(ANNOTATIONS_KEY, annotationId);
    if (!existing) {
      throw new Error('Annotation not found');
    }
    
    const reply = {
      id: `reply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: replyData.content,
      author: replyData.author || '匿名用户',
      authorId: replyData.authorId,
      createdAt: new Date().toISOString(),
    };
    
    const updated = {
      ...existing,
      replies: [...(existing.replies || []), reply],
      updatedAt: new Date().toISOString(),
    };
    
    await kv.hset(ANNOTATIONS_KEY, { [annotationId]: updated });
    await updateMeta();
    return updated;
  } catch (error) {
    console.error('Error adding reply:', error);
    throw error;
  }
};

// 解决/重新打开批注
const resolveAnnotation = async (id, resolved) => {
  return updateAnnotation(id, { resolved });
};

// 主处理函数
export default async function handler(req, res) {
  setCorsHeaders(res);
  
  // 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 初始化 KV
  await initKV();

  const { method, query } = req;

  try {
    // GET /api/annotations - 获取所有批注
    if (method === 'GET' && !query.action) {
      const annotations = await getAnnotations();
      const meta = await getMeta();
      
      return res.status(200).json({
        annotations,
        meta,
        timestamp: Date.now(),
        kvConfigured: kvAvailable,
      });
    }

    // GET /api/annotations?action=status - 检查 KV 配置状态
    if (method === 'GET' && query.action === 'status') {
      return res.status(200).json({
        kvConfigured: kvAvailable,
        message: kvAvailable 
          ? 'Vercel KV 已配置，多人批注功能可用' 
          : '请在 Vercel Dashboard 中配置 KV 存储以启用多人批注功能',
      });
    }

    // POST /api/annotations - 创建批注
    if (method === 'POST' && !query.action) {
      const data = req.body;
      const annotation = await createAnnotation(data);
      return res.status(201).json(annotation);
    }

    // PUT /api/annotations?id=xxx - 更新批注
    if (method === 'PUT' && query.id) {
      const updates = req.body;
      const annotation = await updateAnnotation(query.id, updates);
      return res.status(200).json(annotation);
    }

    // DELETE /api/annotations?id=xxx - 删除批注
    if (method === 'DELETE' && query.id) {
      await deleteAnnotation(query.id);
      return res.status(200).json({ success: true });
    }

    // POST /api/annotations?action=reply&id=xxx - 添加回复
    if (method === 'POST' && query.action === 'reply' && query.id) {
      const replyData = req.body;
      const annotation = await addReply(query.id, replyData);
      return res.status(200).json(annotation);
    }

    // POST /api/annotations?action=resolve&id=xxx - 解决批注
    if (method === 'POST' && query.action === 'resolve' && query.id) {
      const { resolved } = req.body;
      const annotation = await resolveAnnotation(query.id, resolved);
      return res.status(200).json(annotation);
    }

    // 未匹配的路由
    return res.status(404).json({ error: 'Not Found' });

  } catch (error) {
    console.error('Annotations API Error:', error);
    
    // 特殊处理 KV 未配置的错误
    if (error.message === 'KV_NOT_CONFIGURED') {
      return res.status(503).json({ 
        error: 'Service Unavailable',
        message: '多人批注功能需要配置 Vercel KV。请在 Vercel Dashboard > Storage 中创建 KV 数据库并连接到此项目。',
        kvConfigured: false,
      });
    }
    
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message 
    });
  }
}
