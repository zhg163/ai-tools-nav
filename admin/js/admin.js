import { checkAuth, apiRequest, showDialog, renderPagination } from './common.js';

// 检查登录状态
if (!checkAuth()) {
    window.location.href = '/admin/login.html';
}

// 全局变量
let currentPage = 1;
const pageSize = 10;
let filters = {
    category: '',
    status: '',
    pricing: ''
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 加载工具列表
    loadTools(filters);

    // 添加工具按钮事件
    const addToolBtn = document.getElementById('add-tool');
    if (addToolBtn) {
        addToolBtn.addEventListener('click', () => {
            showToolModal();
        });
    }

    // 表单提交事件
    const toolForm = document.getElementById('tool-form');
    if (toolForm) {
        toolForm.addEventListener('submit', handleSubmit);
    }

    // 加载分类下拉框
    loadCategories();

    // 绑定查询和重置按钮事件
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }

    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', handleReset);
    }
});

// 加载工具列表
async function loadTools(filters = {}) {
    const tbody = document.getElementById('tools-list');
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="loading-message">
                    <div class="loading-spinner"></div>
                    加载中...
                </td>
            </tr>
        `;
    }

    try {
        // 构建查询参数
        const queryParams = new URLSearchParams({
            page: currentPage,
            pageSize
        });

        if (filters.category) queryParams.append('category', filters.category);
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.pricing) queryParams.append('pricing', filters.pricing);

        console.log('API请求参数:', queryParams.toString());
        const response = await apiRequest(`/api/admin/tools?${queryParams}`);
        console.log('工具列表响应:', response);

        if (response.code === 0 && response.data && Array.isArray(response.data.list)) {
            renderTools(response.data.list);
            // 渲染分页
            if (response.data.total > pageSize) {
                renderPagination(
                    document.getElementById('tools-pagination'),
                    response.data.total,
                    response.data.page,
                    pageSize,
                    page => {
                        currentPage = page;
                        loadTools(filters);
                    }
                );
            }
        } else {
            showDialog(response.message || '获取工具列表失败', 'error');
        }
    } catch (error) {
        console.error('加载工具失败:', error);
        showDialog('获取工具列表失败', 'error');
    }
}

// 渲染工具列表
function renderTools(tools) {
    const tbody = document.getElementById('tools-list');
    console.log('准备渲染工具列表:', {
        数据: tools,
        数据类型: typeof tools,
        是否为数组: Array.isArray(tools),
        数据长度: tools?.length
    });
    
    if (!tbody) {
        console.error('未找到工具列表容器元素 (tools-list)');
        return;
    }
    
    if (!tools || !Array.isArray(tools) || tools.length === 0) {
        console.log('无数据，显示空状态');
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-message">
                    暂无数据
                </td>
            </tr>
        `;
        return;
    }
    
    console.log('开始生成工具列表 HTML');
    tbody.innerHTML = tools.map(tool => {
        console.log('处理工具:', {
            id: tool._id,
            name: tool.name,
            category: tool.category,
            pricing: tool.pricing
        });
        
        return `
            <tr>
                <td>${tool.name}</td>
                <td>${tool.category?.name || '-'}</td>
                <td>${tool.description}</td>
                <td>
                    <a href="${tool.url}" target="_blank" class="tool-link">
                        ${tool.url}
                    </a>
                </td>
                <td>
                    <span class="price-badge ${tool.pricing || 'free'}">
                        ${tool.pricing === 'paid' ? '付费' : '免费'}
                    </span>
                </td>
                <td>
                    <span class="status-badge ${tool.status}">
                        ${tool.status === 'active' ? '启用' : '禁用'}
                    </span>
                </td>
                <td>
                    <button class="action-btn edit" onclick="editTool('${tool._id}')">编辑</button>
                    <button class="action-btn delete" onclick="deleteTool('${tool._id}')">删除</button>
                </td>
            </tr>
        `;
    }).join('');
    
    console.log('工具列表渲染完成');
}

// HTML转义函数，防止XSS攻击
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// 加载分类列表
async function loadCategories() {
    try {
        const response = await apiRequest('/api/admin/categories');
        if (response.code === 0 && response.data) {
            // 填充工具表单的分类下拉框
            const categorySelect = document.getElementById('tool-category');
            const filterSelect = document.getElementById('category-filter');
            
            if (categorySelect) {
                categorySelect.innerHTML = `
                    <option value="">请选择分类</option>
                    ${response.data.map(category => `
                        <option value="${category._id}">${category.name}</option>
                    `).join('')}
                `;
            }

            // 填充筛选区域的分类下拉框
            if (filterSelect) {
                filterSelect.innerHTML = `
                    <option value="">全部</option>
                    ${response.data.map(category => `
                        <option value="${category._id}">${category.name}</option>
                    `).join('')}
                `;
            }
        }
    } catch (error) {
        console.error('加载分类失败:', error);
        showDialog('获取分类列表失败', 'error');
    }
}

// 显示工具编辑模态框
function showToolModal(tool = null) {
    const modal = document.getElementById('tool-modal');
    const form = document.getElementById('tool-form');
    const title = document.getElementById('modal-title');

    if (!modal || !form || !title) {
        console.error('模态框相关元素未找到');
        return;
    }

    // 重置表单
    form.reset();

    // 设置标题
    title.textContent = tool ? '编辑工具' : '添加工具';

    // 如果是编辑，填充表单
    if (tool) {
        form.name.value = tool.name;
        form.url.value = tool.url;
        form.description.value = tool.description;
        form.category.value = tool.category?._id || '';
        form.pricing.value = tool.pricing || 'free';
        form.status.checked = tool.status === 'active';
        form.dataset.id = tool._id;
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

    try {
        const formData = {
            name: form.name.value,
            url: form.url.value,
            description: form.description.value,
            category: form.category.value,
            pricing: form.pricing.value,
            status: form.status.checked ? 'active' : 'inactive'
        };

        console.log('提交的表单数据:', formData);
        
        const url = isEdit 
            ? `/api/admin/tools/${form.dataset.id}`
            : '/api/admin/tools';
        
        const method = isEdit ? 'PUT' : 'POST';
        
        const response = await apiRequest(url, {
            method,
            body: JSON.stringify(formData)
        });
        
        if (response.code === 0) {
            showDialog(isEdit ? '更新成功' : '添加成功', 'success');
            const modal = document.getElementById('tool-modal');
            if (modal) {
                modal.style.display = 'none';
            }
            form.reset();
            loadTools(filters);
        } else {
            showDialog(response.message || '操作失败', 'error');
        }
    } catch (error) {
        console.error('保存工具失败:', error);
        showDialog('操作失败', 'error');
    }
}

// 编辑工具
async function editTool(id) {
    try {
        const response = await apiRequest(`/api/admin/tools/${id}`);
        if (response.code === 0 && response.data) {
            showToolModal(response.data);
        } else {
            showDialog('获取工具信息失败', 'error');
        }
    } catch (error) {
        console.error('获取工具信息失败:', error);
        showDialog('获取工具信息失败', 'error');
    }
}

// 删除工具
async function deleteTool(id) {
    if (!confirm('确定要删除这个工具吗？')) {
        return;
    }

    try {
        const response = await apiRequest(`/api/admin/tools/${id}`, {
            method: 'DELETE'
        });

        if (response.code === 0) {
            showDialog('删除成功', 'success');
            loadTools();
        } else {
            showDialog(response.message || '删除失败', 'error');
        }
    } catch (error) {
        console.error('删除工具失败:', error);
        showDialog('删除失败', 'error');
    }
}

// 处理查询
function handleSearch() {
    const categoryValue = document.getElementById('category-filter').value;
    const statusValue = document.getElementById('status-filter').value;
    const pricingValue = document.getElementById('free-filter').value;

    console.log('筛选值:', {
        category: categoryValue,
        status: statusValue,
        pricing: pricingValue
    });

    filters = {
        category: categoryValue,
        status: statusValue,
        pricing: pricingValue
    };
    
    console.log('设置的筛选条件:', filters);
    currentPage = 1;
    loadTools(filters);
}

// 处理重置
function handleReset() {
    document.getElementById('category-filter').value = '';
    document.getElementById('status-filter').value = '';
    document.getElementById('free-filter').value = '';
    filters = {
        category: '',
        status: '',
        pricing: ''
    };
    currentPage = 1;
    loadTools(filters);
}

// 将函数暴露给全局作用域，因为它们在 HTML 中被直接调用
window.editTool = editTool;
window.deleteTool = deleteTool; 