import { apiRequest, showError, showSuccess, showModal, hideModal, resetForm, renderPagination } from './common.js';

// 全局变量
let currentPage = 1;
let pageSize = 10;
let totalPages = 1;
let currentFilters = {
    category: '',
    status: '',
    isFree: ''
};

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', async () => {
    console.log('管理页面加载完成');

    // 初始化事件监听
    initEventListeners();
    
    // 加载分类列表
    await loadCategories();
    
    // 加载工具列表
    await loadTools();
});

// 初始化事件监听
function initEventListeners() {
    // 添加工具按钮
    document.getElementById('add-tool-btn').addEventListener('click', () => {
        resetForm('tool-form');
        document.getElementById('modal-title').textContent = '添加工具';
        document.getElementById('tool-id').value = '';
        showModal('tool-modal');
    });

    // 关闭模态框按钮
    document.querySelector('.close-btn').addEventListener('click', () => {
        hideModal('tool-modal');
    });

    // 工具表单提交
    document.getElementById('tool-form').addEventListener('submit', handleToolSubmit);

    // 筛选器变化
    document.getElementById('category-filter').addEventListener('change', handleFilterChange);
    document.getElementById('status-filter').addEventListener('change', handleFilterChange);
    document.getElementById('free-filter').addEventListener('change', handleFilterChange);

    // 退出登录
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
}

// 加载分类列表
async function loadCategories() {
    try {
        const categories = await apiRequest('/admin/categories');
        const filterSelect = document.getElementById('category-filter');
        const formSelect = document.getElementById('tool-category');
        
        // 清空现有选项
        filterSelect.innerHTML = '<option value="">全部</option>';
        formSelect.innerHTML = '<option value="">请选择分类</option>';
        
        // 添加分类选项
        categories.forEach(category => {
            filterSelect.innerHTML += `<option value="${category._id}">${category.name}</option>`;
            formSelect.innerHTML += `<option value="${category._id}">${category.name}</option>`;
        });
    } catch (error) {
        console.error('加载分类失败:', error);
        showError('加载分类失败');
    }
}

// 加载工具列表
async function loadTools() {
    try {
        const queryParams = new URLSearchParams({
            page: currentPage,
            limit: pageSize,
            ...currentFilters
        });

        const response = await apiRequest(`/admin/tools?${queryParams}`);
        const { tools, total, totalPages: pages } = response;
        
        totalPages = pages;
        renderToolsList(tools);
        renderPagination(currentPage, totalPages, handlePageChange);
    } catch (error) {
        console.error('加载工具列表失败:', error);
        showError('加载工具列表失败');
    }
}

// 渲染工具列表
function renderToolsList(tools) {
    const tbody = document.getElementById('tools-list');
    tbody.innerHTML = '';

    tools.forEach(tool => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${tool.name}</td>
            <td>${tool.category?.name || '-'}</td>
            <td>${tool.description}</td>
            <td><a href="${tool.url}" target="_blank">${tool.url}</a></td>
            <td>${tool.isFree ? '是' : '否'}</td>
            <td>${tool.status === 'active' ? '启用' : '禁用'}</td>
            <td>
                <button class="primary-btn" onclick="handleEdit('${tool._id}')">编辑</button>
                <button class="secondary-btn" onclick="handleDelete('${tool._id}')">删除</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// 处理工具表单提交
async function handleToolSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const toolId = document.getElementById('tool-id').value;

    const data = {
        name: formData.get('name'),
        category: formData.get('category'),
        description: formData.get('description'),
        url: formData.get('url'),
        isFree: formData.get('isFree') === 'on',
        status: formData.get('status') === 'on' ? 'active' : 'inactive'
    };

    try {
        if (toolId) {
            await apiRequest(`/admin/tools/${toolId}`, {
                method: 'PUT',
                body: JSON.stringify(data)
            });
            showSuccess('工具更新成功');
        } else {
            await apiRequest('/admin/tools', {
                method: 'POST',
                body: JSON.stringify(data)
            });
            showSuccess('工具添加成功');
        }

        hideModal('tool-modal');
        await loadTools();
    } catch (error) {
        console.error('保存工具失败:', error);
        showError(error.message || '保存失败');
    }
}

// 处理编辑工具
async function handleEdit(toolId) {
    try {
        const tool = await apiRequest(`/admin/tools/${toolId}`);
        
        document.getElementById('modal-title').textContent = '编辑工具';
        document.getElementById('tool-id').value = tool._id;
        document.getElementById('tool-name').value = tool.name;
        document.getElementById('tool-category').value = tool.category;
        document.getElementById('tool-description').value = tool.description;
        document.getElementById('tool-url').value = tool.url;
        document.getElementById('tool-is-free').checked = tool.isFree;
        document.getElementById('tool-status').checked = tool.status === 'active';

        showModal('tool-modal');
    } catch (error) {
        console.error('加载工具详情失败:', error);
        showError('加载工具详情失败');
    }
}

// 处理删除工具
async function handleDelete(toolId) {
    if (!confirm('确定要删除这个工具吗？')) {
        return;
    }

    try {
        await apiRequest(`/admin/tools/${toolId}`, {
            method: 'DELETE'
        });
        
        showSuccess('工具删除成功');
        await loadTools();
    } catch (error) {
        console.error('删除工具失败:', error);
        showError('删除工具失败');
    }
}

// 处理筛选器变化
function handleFilterChange() {
    currentFilters = {
        category: document.getElementById('category-filter').value,
        status: document.getElementById('status-filter').value,
        isFree: document.getElementById('free-filter').value
    };
    
    currentPage = 1;
    loadTools();
}

// 处理页码变化
function handlePageChange(page) {
    currentPage = page;
    loadTools();
}

// 处理退出登录
function handleLogout() {
    localStorage.removeItem('token');
    window.location.href = '/admin/login.html';
}

// 将需要在全局使用的函数添加到 window 对象
window.handleEdit = handleEdit;
window.handleDelete = handleDelete; 