// API客户端配置
const API_BASE_URL = window.location.origin; // 使用相对路径，自动适配
let currentConversationId = 'default-' + Date.now();

// 生成新的会话ID
function generateConversationId() {
    currentConversationId = 'conv-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    return currentConversationId;
}

// 获取会话ID
function getConversationId() {
    return currentConversationId;
}

// 清除会话
function clearConversation() {
    currentConversationId = 'default-' + Date.now();
}

// 调用DeepSeek API（非流式）
async function callDeepSeekAPI(message, model = 'deepseek-chat', conversationId = null, systemPrompt = null, temperature = 0.7) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                conversationId: conversationId || getConversationId(),
                model: model,
                stream: false,
                systemPrompt: systemPrompt,
                temperature: temperature
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || '请求失败');
        }

        const data = await response.json();
        return {
            success: true,
            message: data.message,
            conversationId: data.conversationId,
            usage: data.usage
        };
    } catch (error) {
        console.error('API调用错误:', error);
        return {
            success: false,
            error: error.message || '网络错误，请稍后重试'
        };
    }
}

// 调用DeepSeek API（流式）
async function callDeepSeekAPIStream(message, model = 'deepseek-chat', conversationId = null, onChunk = null, onComplete = null, onError = null) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/chat/stream`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                conversationId: conversationId || getConversationId(),
                model: model
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || '请求失败');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let fullMessage = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') {
                        if (onComplete) onComplete(fullMessage);
                        return { success: true, message: fullMessage };
                    }
                    try {
                        const json = JSON.parse(data);
                        if (json.content) {
                            fullMessage += json.content;
                            if (onChunk) onChunk(json.content);
                        }
                        if (json.error) {
                            throw new Error(json.error);
                        }
                    } catch (e) {
                        // 忽略JSON解析错误
                    }
                }
            }
        }

        if (onComplete) onComplete(fullMessage);
        return { success: true, message: fullMessage };
    } catch (error) {
        console.error('流式API调用错误:', error);
        if (onError) onError(error);
        return {
            success: false,
            error: error.message || '网络错误，请稍后重试'
        };
    }
}

// 清除对话历史
async function clearConversationHistory(conversationId = null) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/chat/clear`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                conversationId: conversationId || getConversationId()
            })
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('清除对话历史错误:', error);
        return { success: false, error: error.message };
    }
}

// 健康检查
async function checkAPIHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/health`);
        const data = await response.json();
        return data;
    } catch (error) {
        return { status: 'error', error: error.message };
    }
}

