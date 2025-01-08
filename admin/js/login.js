import { apiRequest, showError } from './common.js';

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

        if (!username || !password) {
            console.log('用户名或密码为空');
            showError('请输入用户名和密码');
            return;
        }

        // 禁用提交按钮防止重复提交
        submitButton.disabled = true;
        submitButton.textContent = '登录中...';

        try {
            console.log('准备发送登录请求');
            const response = await apiRequest('/admin/login', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });

            console.log('登录请求响应:', response);
            if (response && response.token) {
                console.log('登录成功，保存token');
                localStorage.setItem('token', response.token);
                window.location.href = '/admin/index.html';
            } else {
                console.log('登录响应中没有token');
                throw new Error('登录失败：服务器响应格式错误');
            }
        } catch (error) {
            console.error('登录失败:', error);
            showError(error.message || '登录失败，请检查用户名和密码');
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