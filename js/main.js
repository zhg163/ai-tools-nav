// 获取工具列表
async function fetchTools(category = '') {
    const url = category 
        ? `/api/tools/${category}`
        : '/api/tools';
    
    try {
        const response = await fetch(url);
        const tools = await response.json();
        renderTools(tools);
    } catch (error) {
        console.error('Error fetching tools:', error);
    }
}

// 渲染工具卡片
function renderTools(tools) {
    const toolsGrid = document.querySelector('.tools-grid');
    toolsGrid.innerHTML = tools.map(tool => `
        <div class="tool-card">
            <div class="tool-header">
                <h3>${tool.name}</h3>
                <span class="tag">${tool.isFree ? '免费' : '付费'}</span>
            </div>
            <p class="tool-desc">${tool.description}</p>
            <div class="tool-footer">
                <a href="${tool.url}" target="_blank" class="visit-btn">访问</a>
                <span class="category-tag ${tool.category}">${getCategoryName(tool.category)}</span>
            </div>
        </div>
    `).join('');
} 