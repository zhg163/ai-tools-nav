import { apiRequest, showDialog } from './common.js';

// 添加全局错误处理
window.onerror = function(msg, url, line, col, error) {
    console.error('Global error:', {
        message: msg,
        url: url,
        line: line,
        column: col,
        error: error
    });
    showDebugInfo(`全局错误: ${msg}\n位置: ${url}:${line}:${col}\n${error?.stack || ''}`);
    return false;
};

// 添加Promise错误处理
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    showDebugInfo(`未处理的Promise错误: ${event.reason}`);
});

document.addEventListener('DOMContentLoaded', () => {
    console.log('登录页面加载完成');
    const loginForm = document.getElementById('login-form');
    const submitButton = loginForm.querySelector('button[type="submit"]');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    // 如果已经登录，直接跳转到管理页面
    const token = localStorage.getItem('token');
    if (token) {
        console.log('检测到已有token，准备跳转到管理页面');
        window.location.href = '/admin/index.html';
        return;
    }

    // 表单提交处理
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('提交登录表单');

        // 简单的输入验证
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        // 记录登录尝试（不记录密码）
        console.log('登录尝试:', { username });

        if (!username || !password) {
            console.log('用户名或密码为空');
            showDialog('请输入用户名和密码', 'error');
            return;
        }

        // 禁用提交按钮防止重复提交
        submitButton.disabled = true;
        submitButton.textContent = '登录中...';

        try {
            console.log('准备发送登录请求');
            const response = await apiRequest('/api/admin/login', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });

            // 详细记录登录响应（不包含敏感信息）
            console.log('登录响应:', {
                success: !!response?.token,
                hasToken: !!response?.token
            });

            if (response && response.token) {
                console.log('登录成功，保存token');
                localStorage.setItem('token', response.token);
                window.location.replace('/admin/index.html');
            } else {
                console.log('登录响应中没有token');
                showDialog('用户名或密码错误', 'error');
                // 重置密码输入
                passwordInput.value = '';
                passwordInput.focus();
            }
        } catch (error) {
            // 详细记录登录错误
            console.error('登录失败详情:', {
                error,
                message: error.message,
                type: error.constructor.name
            });
            showDialog('用户名或密码错误', 'error');
            
            // 登录失败时重置密码输入
            passwordInput.value = '';
            passwordInput.focus();
        } finally {
            // 恢复提交按钮状态
            submitButton.disabled = false;
            submitButton.textContent = '登录';
        }
    });

    // 输入框事件处理
    const inputs = [usernameInput, passwordInput];
    inputs.forEach(input => {
        // 输入时隐藏错误消息
        input.addEventListener('input', () => {
            const errorMessage = document.getElementById('error-message');
            if (errorMessage.style.display === 'block') {
                errorMessage.style.display = 'none';
            }
        });

        // 添加回车键提交支持
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                submitButton.click();
            }
        });
    });
});

function showDebugInfo(info) {
    const debugContent = document.getElementById('debug-content');
    const debugInfo = document.getElementById('debug-info');
    if (debugContent && debugInfo) {
        debugContent.textContent += new Date().toISOString() + ': ' + info + '\n';
        debugInfo.style.display = 'block';
    }
} 