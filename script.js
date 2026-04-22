document.addEventListener('DOMContentLoaded', () => {
    console.log('Breaking News App Initialized');

    // State management
    let allNews = [];
    let currentCategory = 'all';

    // UI Elements
    const highlightsGrid = document.getElementById('highlights-grid');
    const newsGrid = document.getElementById('news-grid');
    const trendSentence = document.getElementById('trend-sentence');
    const hashtagsContainer = document.getElementById('hashtags');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const lastUpdatedEl = document.getElementById('last-updated');
    const lastSyncedEl = document.getElementById('last-synced');

    // Buttons
    const quickBtn = document.getElementById('quick-refresh');
    const fullBtn = document.getElementById('full-refresh');
    const reloadBtn = document.getElementById('reload-cache');
    const openSettingsBtn = document.getElementById('open-settings');
    const saveSettingsBtn = document.getElementById('save-settings');
    
    // Modal Elements
    const settingsModal = document.getElementById('settings-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    const gasUrlInput = document.getElementById('gas-url');

    // Load GAS URL from localStorage
    let gasUrl = localStorage.getItem('breaking_news_gas_url') || '';
    if (gasUrlInput) gasUrlInput.value = gasUrl;

    // Helper to show/hide loading
    function setLoading(isLoading) {
        const btns = [quickBtn, fullBtn, reloadBtn];
        btns.forEach(btn => {
            if (btn) {
                btn.disabled = isLoading;
                btn.style.opacity = isLoading ? '0.5' : '1';
            }
        });
        if (isLoading) {
            newsGrid.innerHTML = '<div class="loading">載入中...</div>';
        }
    }

    // Fetch and render news
    async function loadNews(type = 'reload') {
        console.log('Loading news type:', type);
        
        if (!gasUrl) {
            console.warn('No GAS URL found, opening settings');
            if (settingsModal) settingsModal.classList.add('active');
            return;
        }

        setLoading(true);

        try {
            const url = `${gasUrl}${gasUrl.includes('?') ? '&' : '?'}type=${type}`;
            console.log('Fetching from:', url);
            
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const data = await response.json();
            console.log('Received data:', data);

            if (data.error) {
                throw new Error(data.error);
            }

            allNews = data.news || [];
            updateTimestamps(data.lastUpdated, data.lastSynced);
            renderHighlights(allNews.slice(0, 3));
            renderTrending(data.trends || {});
            renderNewsFeed(allNews.slice(3));

        } catch (error) {
            console.error('Failed to load news:', error);
            alert('無法載入新聞資料。\n原因：' + error.message + '\n\n請檢查：\n1. Google Apps Script 網址是否正確\n2. 部署時是否選擇「所有人 (Anyone)」皆可存取\n3. 網址末端是否有 /exec');
            if (settingsModal) settingsModal.classList.add('active');
        } finally {
            setLoading(false);
        }
    }

    function updateTimestamps(updated, synced) {
        if (lastUpdatedEl) lastUpdatedEl.textContent = updated || '--';
        if (lastSyncedEl) lastSyncedEl.textContent = synced || '--';
    }

    function renderHighlights(highlights) {
        if (!highlightsGrid) return;
        if (highlights.length === 0) {
            highlightsGrid.innerHTML = '<p>尚無重點新聞</p>';
            return;
        }
        highlightsGrid.innerHTML = highlights.map(news => createCard(news, true)).join('');
    }

    function renderTrending(trends) {
        if (trendSentence) trendSentence.textContent = trends.sentence || '正在分析全球趨勢...';
        if (hashtagsContainer) {
            hashtagsContainer.innerHTML = (trends.tags || []).map(tag => `<span class="tag">#${tag}</span>`).join('');
        }
    }

    function renderNewsFeed(newsItems) {
        if (!newsGrid) return;
        const filtered = currentCategory === 'all' 
            ? newsItems 
            : newsItems.filter(item => item.category && item.category.toLowerCase() === currentCategory.toLowerCase());
        
        if (filtered.length === 0) {
            newsGrid.innerHTML = '<p>該分類目前沒有新聞</p>';
            return;
        }
        newsGrid.innerHTML = filtered.map(news => createCard(news, false)).join('');
    }

    function createCard(news, isLarge) {
        const impact = news.impact || 'Low';
        const impactClass = `impact-${impact.toLowerCase()}`;
        const impactIcon = impact === 'High' ? '🔴' : (impact === 'Medium' ? '🟡' : '⚪');
        const impactLabel = impact === 'High' ? '高影響' : (impact === 'Medium' ? '中影響' : '低影響');

        return `
            <div class="news-card ${isLarge ? 'large' : ''}">
                <div class="card-impact ${impactClass}">
                    ${impactIcon} ${impactLabel} (${news.impactNote || ''})
                </div>
                <h3 class="card-title">${news.title || '無標題'}</h3>
                <p class="card-summary">${news.summary || '無摘要'}</p>
                <div class="card-why">
                    <strong>Why it matters:</strong> ${news.whyItMatters || '分析中'}
                </div>
                <div class="card-meta">
                    <span class="source-info">
                        <strong>${news.source || '未知來源'}</strong> • ${news.time || ''}
                    </span>
                    <a href="${news.url || '#'}" target="_blank" class="card-source-btn">Source</a>
                </div>
            </div>
        `;
    }

    // Settings logic
    if (openSettingsBtn) {
        openSettingsBtn.addEventListener('click', () => {
            if (settingsModal) settingsModal.classList.add('active');
        });
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            if (settingsModal) settingsModal.classList.remove('active');
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            settingsModal.classList.remove('active');
        }
    });

    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', () => {
            const newUrl = gasUrlInput ? gasUrlInput.value.trim() : '';
            if (newUrl && newUrl.startsWith('http')) {
                localStorage.setItem('breaking_news_gas_url', newUrl);
                gasUrl = newUrl;
                if (settingsModal) settingsModal.classList.remove('active');
                loadNews('reload');
            } else {
                alert('請輸入有效的 Google Apps Script 網址 (需以 http 開頭)');
            }
        });
    }

    // Tab switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.category;
            renderNewsFeed(allNews.slice(3));
        });
    });

    // Button event listeners
    if (quickBtn) quickBtn.addEventListener('click', () => loadNews('quick'));
    if (fullBtn) fullBtn.addEventListener('click', () => loadNews('full'));
    if (reloadBtn) reloadBtn.addEventListener('click', () => loadNews('reload'));

    // Initial load
    if (gasUrl) {
        loadNews('reload');
    } else {
        console.log('No GAS URL on init, showing modal');
        if (settingsModal) settingsModal.classList.add('active');
    }
});
