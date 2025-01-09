import { checkAuth, apiRequest, showDialog } from './common.js';
import { initToolsManagement } from './admin.js';
import { initCategoriesManagement } from './category.js';

// 检查登录状态
if (!checkAuth()) {
    window.location.href = '/admin/login.html';
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始化两个模块
    initToolsManagement();
    initCategoriesManagement();

    // 处理导航切换
    const navLinks = document.querySelectorAll('.nav-link[data-section]');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            switchSection(section);
        });
    });

    // 根据 URL hash 显示对应部分
    const hash = window.location.hash.slice(1) || 'tools';
    switchSection(hash);

    // 处理退出登录
    document.getElementById('logout').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        window.location.href = '/admin/login.html';
    });
});

// 切换显示不同部分
function switchSection(section) {
    // 更新 URL
    window.location.hash = section;

    // 更新导航状态
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`.nav-link[data-section="${section}"]`).classList.add('active');

    // 更新内容显示
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.style.display = 'none';
    });
    document.getElementById(`${section}-section`).style.display = 'block';
} 