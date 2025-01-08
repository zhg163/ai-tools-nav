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
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
    };

    const url = `${API_BASE_URL}${endpoint}`;
    console.log('发送请求到:', url, '选项:', { ...options, headers: defaultOptions.headers });

    try {
        const response = await fetch(url, {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...(options.headers || {})
            }
        });

        console.log('收到响应:', {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries())
        });

        if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/admin/login.html';
            return null;
        }

        const data = await response.json();
        console.log('响应数据:', data);

        if (!response.ok) {
            throw new Error(data.message || '请求失败');
        }

        return data;
    } catch (error) {
        console.error('API 请求错误:', error);
        if (error instanceof TypeError && error.message.includes('JSON')) {
            console.error('JSON 解析错误，原始响应:', await response.text());
        }
        throw error;
    }
}

// 显示错误消息
function showError(message, elementId = 'error-message') {
    console.log('显示错误消息:', message);
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 3000);
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

// 导出工具函数
export {
    checkAuth,
    apiRequest,
    showError,
    showSuccess,
    formatDate,
    showModal,
    hideModal,
    resetForm,
    setActiveNavItem,
    renderPagination
}; 