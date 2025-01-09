import { checkAuth, apiRequest, showDialog, renderPagination } from './common.js';

// 检查登录状态
if (!checkAuth()) {
    window.location.href = '/admin/login.html';
}

// 全局变量
let currentPage = 1;
const pageSize = 10;
let selectedCategories = new Set();

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 加载分类列表
    loadCategories();

    // 添加分类按钮事件
    document.getElementById('add-category').addEventListener('click', () => {
        showCategoryModal();
    });

    // 表单提交事件
    document.getElementById('categoryForm').addEventListener('submit', handleSubmit);

    // 添加关闭按钮和遮罩层点击事件
    const modal = document.getElementById('categoryModal');
    const closeBtn = modal.querySelector('.close-btn');

    // 关闭按钮点击事件
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // 点击模态框外部关闭
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // ESC键关闭模态框
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            modal.style.display = 'none';
        }
    });

    // 初始化拖拽排序
    const tbody = document.getElementById('categories-list');
    new Sortable(tbody, {
        animation: 150,
        handle: '.drag-handle',
        onEnd: async function(evt) {
            const orders = Array.from(tbody.children).map((tr, index) => ({
                id: tr.dataset.id,
                weight: categories.length - index
            }));
            
            try {
                const response = await apiRequest('/api/admin/categories/reorder', {
                    method: 'POST',
                    body: JSON.stringify({ orders })
                });

                if (response.code === 0) {
                    showDialog('排序更新成功', 'success');
                } else {
                    showDialog(response.message || '排序更新失败', 'error');
                    loadCategories(); // 重新加载以恢复原始顺序
                }
            } catch (error) {
                console.error('更新排序失败:', error);
                showDialog('排序更新失败', 'error');
                loadCategories();
            }
        }
    });
});

// 加载分类列表
async function loadCategories() {
    try {
        const response = await apiRequest('/api/admin/categories');
        console.log('分类列表响应:', {
            状态码: response.code,
            数据总数: response.data?.length,
            详细数据: response.data
        });
        
        if (response.code === 0 && response.data) {
            renderCategories(response.data);
            window.categories = response.data;
        } else {
            showDialog(`获取分类列表失败: ${response.message || '未知错误'}`, 'error');
        }
    } catch (error) {
        console.error('加载分类失败:', error.message, error.stack);
        showDialog('获取分类列表失败', 'error');
    }
}

// 渲染分类列表
function renderCategories(categories) {
    const tbody = document.getElementById('categories-list');
    tbody.innerHTML = categories.map(category => `
        <tr data-id="${category._id}">
            <td>${category.name}</td>
            <td>${category.code}</td>
            <td>${category.description}</td>
            <td>${category.weight || 0}</td>
            <td>
                <span class="status-badge ${category.status}">
                    ${category.status === 'active' ? '启用' : '禁用'}
                </span>
            </td>
            <td>
                <button class="action-btn edit" onclick="editCategory('${category._id}')">
                    编辑
                </button>
                <button class="action-btn delete" onclick="deleteCategory('${category._id}')">
                    删除
                </button>
            </td>
        </tr>
    `).join('');
}

// 显示分类编辑模态框
function showCategoryModal(category = null) {
    const modal = document.getElementById('categoryModal');
    const form = document.getElementById('categoryForm');
    const title = document.getElementById('modalTitle');

    // 重置表单
    form.reset();

    // 设置标题
    title.textContent = category ? '编辑分类' : '添加分类';

    // 如果是编辑，填充表单
    if (category) {
        form.name.value = category.name;
        form.code.value = category.code;
        form.description.value = category.description;
        form.weight.value = category.weight || 0;
        form.status.checked = category.status === 'active';
        form.dataset.id = category._id;
    } else {
        delete form.dataset.id;
    }

    // 显示模态框
    modal.style.display = 'block';
}

// 处理表单提交
async function handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const isEdit = !!form.dataset.id;

    console.log('提交的表单数据:', {
        name: form.name.value,
        code: form.code.value,
        description: form.description.value,
        weight: form.weight.value,
        status: form.status.checked
    });

    try {
        const formData = {
            name: form.name.value,
            code: form.code.value,
            description: form.description.value,
            weight: parseInt(form.weight.value) || 0,
            status: form.status.checked ? 'active' : 'inactive'
        };

        console.log('发送到服务器的数据:', formData);

        const url = isEdit 
            ? `/api/admin/categories/${form.dataset.id}`
            : '/api/admin/categories';
        
        const method = isEdit ? 'PUT' : 'POST';

        const response = await apiRequest(url, {
            method,
            body: JSON.stringify(formData)
        });

        console.log('服务器响应:', response);

        if (response.code === 0) {
            showDialog(isEdit ? '更新成功' : '添加成功', 'success');
            // 关闭模态框
            document.getElementById('categoryModal').style.display = 'none';
            // 重置表单
            form.reset();
            // 刷新分类列表
            loadCategories();
        } else {
            showDialog(response.message || '操作失败', 'error');
        }
    } catch (error) {
        console.error('保存分类失败:', error);
        showDialog('操作失败', 'error');
    }
}

// 编辑分类
async function editCategory(id) {
    try {
        const response = await apiRequest(`/api/admin/categories/${id}`);
        if (response.code === 0 && response.data) {
            showCategoryModal(response.data);
        } else {
            showDialog('获取分类信息失败', 'error');
        }
    } catch (error) {
        console.error('获取分类信息失败:', error);
        showDialog('获取分类信息失败', 'error');
    }
}

// 删除分类
async function deleteCategory(id) {
    if (!confirm('确定要删除这个分类吗？')) {
        return;
    }

    try {
        const response = await apiRequest(`/api/admin/categories/${id}`, {
            method: 'DELETE'
        });

        if (response.code === 0) {
            showDialog('删除成功', 'success');
            loadCategories();
        } else {
            showDialog(response.message || '删除失败', 'error');
        }
    } catch (error) {
        console.error('删除分类失败:', error);
        showDialog('删除失败', 'error');
    }
}

// 将函数暴露给全局作用域，因为它们在 HTML 中被直接调用
window.editCategory = editCategory;
window.deleteCategory = deleteCategory; 