import {
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
} from './common.js';

// 当前页码和每页数量
let currentPage = 1;
const pageSize = 10;

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', async () => {
    // 检查登录状态
    if (!checkAuth()) return;

    // 设置导航菜单激活状态
    setActiveNavItem();

    // 加载分类列表
    await loadCategories();

    // 绑定事件处理函数
    bindEvents();
});

// 加载分类列表
async function loadCategories(filters = {}) {
    try {
        const queryParams = new URLSearchParams({
            page: currentPage,
            limit: pageSize,
            ...filters
        });

        const response = await apiRequest(`/admin/categories?${queryParams}`);
        const { data, total, totalPages } = response;

        renderCategoryList(data);
        renderPagination(currentPage, totalPages, (page) => {
            currentPage = page;
            loadCategories(filters);
        });
    } catch (error) {
        showError('加载分类列表失败');
    }
}

// 渲染分类列表
function renderCategoryList(categories) {
    const tbody = document.querySelector('#category-list tbody');
    tbody.innerHTML = '';

    categories.forEach(category => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${category.name}</td>
            <td>${category.code}</td>
            <td>${category.description || '-'}</td>
            <td>${category.weight}</td>
            <td><span class="tool-status ${category.status === 'active' ? 'status-active' : 'status-inactive'}">
                ${category.status === 'active' ? '启用' : '禁用'}
            </span></td>
            <td>${formatDate(category.createdAt)}</td>
            <td>
                <div class="tool-actions">
                    <button class="action-btn edit-btn" data-id="${category._id}">编辑</button>
                    <button class="action-btn delete-btn" data-id="${category._id}">删除</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// 绑定事件处理函数
function bindEvents() {
    // 添加分类按钮点击事件
    document.getElementById('add-category-btn').addEventListener('click', () => {
        resetForm('category-form');
        document.getElementById('category-form').dataset.mode = 'add';
        document.getElementById('modal-title').textContent = '添加分类';
        showModal('category-modal');
    });

    // 模态框关闭按钮点击事件
    document.querySelector('.close').addEventListener('click', () => {
        hideModal('category-modal');
    });

    // 分类表单提交事件
    document.getElementById('category-form').addEventListener('submit', handleCategorySubmit);

    // 编辑按钮点击事件
    document.addEventListener('click', async (e) => {
        if (e.target.classList.contains('edit-btn')) {
            const categoryId = e.target.dataset.id;
            await loadCategoryDetails(categoryId);
        }
    });

    // 删除按钮点击事件
    document.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const categoryId = e.target.dataset.id;
            if (confirm('确定要删除这个分类吗？')) {
                await deleteCategory(categoryId);
            }
        }
    });

    // 过滤表单提交事件
    document.getElementById('filter-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const filters = {
            status: document.getElementById('filter-status').value,
            keyword: document.getElementById('filter-keyword').value
        };
        currentPage = 1;
        loadCategories(filters);
    });
}

// 加载分类详情
async function loadCategoryDetails(categoryId) {
    try {
        const response = await apiRequest(`/admin/categories/${categoryId}`);
        const category = response.data;

        document.getElementById('category-form').dataset.mode = 'edit';
        document.getElementById('category-form').dataset.id = categoryId;
        document.getElementById('modal-title').textContent = '编辑分类';

        document.getElementById('name').value = category.name;
        document.getElementById('code').value = category.code;
        document.getElementById('description').value = category.description || '';
        document.getElementById('weight').value = category.weight;
        document.getElementById('status').value = category.status;

        showModal('category-modal');
    } catch (error) {
        showError('加载分类详情失败');
    }
}

// 处理分类表单提交
async function handleCategorySubmit(e) {
    e.preventDefault();

    const form = e.target;
    const mode = form.dataset.mode;
    const categoryId = form.dataset.id;

    const categoryData = {
        name: document.getElementById('name').value,
        code: document.getElementById('code').value,
        description: document.getElementById('description').value,
        weight: parseInt(document.getElementById('weight').value),
        status: document.getElementById('status').value
    };

    try {
        if (mode === 'add') {
            await apiRequest('/admin/categories', {
                method: 'POST',
                body: JSON.stringify(categoryData)
            });
            showSuccess('分类添加成功');
        } else {
            await apiRequest(`/admin/categories/${categoryId}`, {
                method: 'PUT',
                body: JSON.stringify(categoryData)
            });
            showSuccess('分类更新成功');
        }

        hideModal('category-modal');
        loadCategories();
    } catch (error) {
        showError(error.message || '操作失败');
    }
}

// 删除分类
async function deleteCategory(categoryId) {
    try {
        await apiRequest(`/admin/categories/${categoryId}`, {
            method: 'DELETE'
        });
        showSuccess('分类删除成功');
        loadCategories();
    } catch (error) {
        showError('删除分类失败');
    }
} 