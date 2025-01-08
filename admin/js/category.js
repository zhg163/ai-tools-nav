import { apiRequest, showError, showSuccess, showModal, hideModal, resetForm, renderPagination } from './common.js';

let currentPage = 1;
let pageSize = 10;
let totalPages = 1;
let currentStatusFilter = '';

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', async () => {
    console.log('分类管理页面加载完成');

    // 初始化事件监听
    initEventListeners();
    
    // 加载分类列表
    await loadCategories();
});

// 初始化事件监听
function initEventListeners() {
    // 添加分类按钮
    document.getElementById('add-category-btn').addEventListener('click', () => {
        resetForm('category-form');
        document.getElementById('modal-title').textContent = '添加分类';
        document.getElementById('category-id').value = '';
        showModal('category-modal');
    });

    // 关闭模态框按钮
    document.querySelector('.close-btn').addEventListener('click', () => {
        hideModal('category-modal');
    });

    // 分类表单提交
    document.getElementById('category-form').addEventListener('submit', handleCategorySubmit);

    // 筛选器变化
    document.getElementById('status-filter').addEventListener('change', handleFilterChange);
}

// 加载分类列表
async function loadCategories() {
    try {
        const queryParams = new URLSearchParams({
            page: currentPage,
            limit: pageSize,
            status: currentStatusFilter
        });

        const response = await apiRequest(`/admin/categories?${queryParams}`);
        const { list, total, totalPages: pages } = response.data;
        
        totalPages = pages;
        renderCategoryList(list);
        renderPagination(currentPage, totalPages, handlePageChange);
    } catch (error) {
        console.error('加载分类列表失败:', error);
        showError('加载分类列表失败');
    }
}

// 渲染分类列表
function renderCategoryList(categories) {
    const tbody = document.getElementById('categories-list');
    tbody.innerHTML = '';

    categories.forEach(category => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${category.name}</td>
            <td>${category.code}</td>
            <td>${category.description}</td>
            <td>${category.status === 'active' ? '启用' : '禁用'}</td>
            <td>
                <button class="primary-btn" onclick="handleEdit('${category._id}')">编辑</button>
                <button class="secondary-btn" onclick="handleDelete('${category._id}')">删除</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// 处理分类表单提交
async function handleCategorySubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const categoryId = document.getElementById('category-id').value;

    const data = {
        name: formData.get('name'),
        code: formData.get('code'),
        description: formData.get('description'),
        status: formData.get('status') === 'on' ? 'active' : 'inactive'
    };

    try {
        if (categoryId) {
            await apiRequest(`/admin/categories/${categoryId}`, {
                method: 'PUT',
                body: JSON.stringify(data)
            });
            showSuccess('分类更新成功');
        } else {
            await apiRequest('/admin/categories', {
                method: 'POST',
                body: JSON.stringify(data)
            });
            showSuccess('分类添加成功');
        }

        hideModal('category-modal');
        await loadCategories();
    } catch (error) {
        console.error('保存分类失败:', error);
        showError(error.message || '保存失败');
    }
}

// 处理编辑分类
async function handleEdit(categoryId) {
    try {
        const category = await apiRequest(`/admin/categories/${categoryId}`);
        
        document.getElementById('modal-title').textContent = '编辑分类';
        document.getElementById('category-id').value = category._id;
        document.getElementById('category-name').value = category.name;
        document.getElementById('category-code').value = category.code;
        document.getElementById('category-description').value = category.description;
        document.getElementById('category-status').checked = category.status === 'active';

        showModal('category-modal');
    } catch (error) {
        console.error('加载分类详情失败:', error);
        showError('加载分类详情失败');
    }
}

// 处理删除分类
async function handleDelete(categoryId) {
    if (!confirm('确定要删除这个分类吗？')) {
        return;
    }

    try {
        await apiRequest(`/admin/categories/${categoryId}`, {
            method: 'DELETE'
        });
        
        showSuccess('分类删除成功');
        await loadCategories();
    } catch (error) {
        console.error('删除分类失败:', error);
        showError('删除分类失败');
    }
}

// 处理筛选器变化
function handleFilterChange() {
    currentStatusFilter = document.getElementById('status-filter').value;
    currentPage = 1;
    loadCategories();
}

// 处理页码变化
function handlePageChange(page) {
    currentPage = page;
    loadCategories();
}

// 将需要在全局使用的函数添加到 window 对象
window.handleEdit = handleEdit;
window.handleDelete = handleDelete; 