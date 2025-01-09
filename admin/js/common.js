// API 基础 URL
const API_BASE_URL = '/api';

// 检查登录状态
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/admin/login.html';
        return false;
    }
    return true;
}

// 通用 API 请求函数
async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    // 设置默认headers
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    };

    const url = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;
    console.log('API请求:', { url, options });

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                ...headers,
                ...options.headers
            }
        });

        console.log('API响应状态:', response.status);
        const data = await response.json();
        console.log('API响应数据:', data);

        if (!response.ok) {
            console.error('API请求失败:', {
                status: response.status,
                statusText: response.statusText,
                data
            });
            throw new Error(data.message || '请求失败');
        }

        return data;
    } catch (error) {
        console.error('API请求失败:', error);
        throw error;
    }
}

// 显示错误消息
function showError(message, elementId = 'error-message') {
    console.log('显示错误消息:', message);
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        // 设置消息内容
        errorElement.innerHTML = `
            <div class="error-content">
                <span class="error-icon">❌</span>
                <span class="error-text">${message}</span>
            </div>
        `;
        
        // 显示错误消息
        errorElement.classList.add('show');
        
        setTimeout(() => {
            errorElement.classList.remove('show');
        }, 5000);

        // 记录到调试信息
        const debugContent = document.getElementById('debug-content');
        if (debugContent) {
            debugContent.textContent += `${new Date().toISOString()} - Error: ${message}\n`;
        }
    } else {
        console.error('未找到错误消息元素:', elementId);
    }
}

// 显示成功消息
function showSuccess(message, elementId = 'success-message') {
    console.log('显示成功消息:', message);
    const successElement = document.getElementById(elementId);
    if (successElement) {
        successElement.textContent = message;
        successElement.style.display = 'block';
        setTimeout(() => {
            successElement.style.display = 'none';
        }, 3000);
    } else {
        console.error('未找到成功消息元素:', elementId);
    }
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// 模态框操作
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// 表单重置
function resetForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
        form.reset();
    }
}

// 导航菜单激活状态
function setActiveNavItem() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// 分页组件
function renderPagination(currentPage, totalPages, onPageChange) {
    const pagination = document.querySelector('.pagination');
    if (!pagination) return;

    pagination.innerHTML = '';

    // 上一页按钮
    const prevButton = document.createElement('button');
    prevButton.className = 'page-btn';
    prevButton.textContent = '上一页';
    prevButton.disabled = currentPage === 1;
    prevButton.onclick = () => onPageChange(currentPage - 1);
    pagination.appendChild(prevButton);

    // 页码按钮
    for (let i = 1; i <= totalPages; i++) {
        if (
            i === 1 ||
            i === totalPages ||
            (i >= currentPage - 2 && i <= currentPage + 2)
        ) {
            const pageButton = document.createElement('button');
            pageButton.className = `page-btn ${i === currentPage ? 'active' : ''}`;
            pageButton.textContent = i;
            pageButton.onclick = () => onPageChange(i);
            pagination.appendChild(pageButton);
        } else if (
            i === currentPage - 3 ||
            i === currentPage + 3
        ) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'page-ellipsis';
            ellipsis.textContent = '...';
            pagination.appendChild(ellipsis);
        }
    }

    // 下一页按钮
    const nextButton = document.createElement('button');
    nextButton.className = 'page-btn';
    nextButton.textContent = '下一页';
    nextButton.disabled = currentPage === totalPages;
    nextButton.onclick = () => onPageChange(currentPage + 1);
    pagination.appendChild(nextButton);
}

// 显示对话框
function showDialog(message, type = 'info') {
    // 移除可能存在的旧对话框
    const oldDialog = document.querySelector('.dialog');
    if (oldDialog) {
        oldDialog.remove();
    }

    // 获取登录表单元素
    const loginForm = document.querySelector('.login-form');
    if (!loginForm) {
        console.error('未找到登录表单元素');
        return;
    }

    const dialog = document.createElement('div');
    dialog.className = `dialog dialog-${type}`;
    dialog.innerHTML = `
        <div class="dialog-content">
            <div class="dialog-message">
                <span class="dialog-icon">${type === 'error' ? '❌' : '⚠️'}</span>
                <span class="dialog-text">${message}</span>
            </div>
            <button class="dialog-btn" onclick="this.parentElement.parentElement.remove()">确定</button>
        </div>
    `;

    // 确保对话框可见
    dialog.style.display = 'block';
    dialog.style.visibility = 'visible';
    dialog.style.opacity = '1';

    // 将对话框插入到用户名输入框之前
    const usernameGroup = loginForm.querySelector('.form-group');
    loginForm.insertBefore(dialog, usernameGroup);

    // 添加调试日志
    console.log('对话框已创建:', {
        message,
        type,
        dialogElement: dialog,
        formElement: loginForm
    });

    // 自动关闭时间延长
    setTimeout(() => {
        if (dialog && dialog.parentElement) {
            dialog.remove();
        }
    }, 5000);
}

// 导出工具函数
export {
    checkAuth,
    apiRequest,
    showError,
    showSuccess,
    showDialog,
    formatDate,
    showModal,
    hideModal,
    resetForm,
    setActiveNavItem,
    renderPagination
}; 