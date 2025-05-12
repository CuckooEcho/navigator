// API服务模块
const apiService = {
  baseUrl: 'http://localhost:8000',
  
  async fetchItems() {
    const response = await fetch(`${this.baseUrl}/items`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  },
  
  async createItem(itemData) {
    const response = await fetch(`${this.baseUrl}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData)
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  },
  
  async updateItem(itemId, itemData) {
    const response = await fetch(`${this.baseUrl}/items/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData)
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  },
  
  async deleteItem(itemId) {
    const response = await fetch(`${this.baseUrl}/items/${itemId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return true;
  }
};

// 状态管理模块
const appState = {
  items: [],
  filteredItems: [],
  isConnected: false,
  lastUpdated: null,
  
  setItems(items) {
    this.items = items;
    this.filteredItems = [...items];
    this.lastUpdated = new Date();
    this.updateStats();
  },
  
  filterItems(query) {
    if (!query.trim()) {
      this.filteredItems = [...this.items];
      document.getElementById('filter-status').textContent = 'All items';
      return;
    }
    
    const lowerQuery = query.toLowerCase();
    this.filteredItems = this.items.filter(item => 
      item.name.toLowerCase().includes(lowerQuery) || 
      (item.description?.toLowerCase()?.includes(lowerQuery) || false)
    );
    
    document.getElementById('filter-status').textContent = 
      `Filtered: ${this.filteredItems.length} of ${this.items.length} items`;
  },
  
  updateStats() {
    const totalItemsEl = document.getElementById('total-items');
    const totalValueEl = document.getElementById('total-value');
    const lastUpdatedEl = document.getElementById('last-updated');
    
    if (totalItemsEl) totalItemsEl.textContent = this.items.length;
    
    const totalValue = this.items.reduce((sum, item) => 
      sum + (parseFloat(item.price) || 0), 0
    );
    if (totalValueEl) totalValueEl.textContent = `$${totalValue.toFixed(2)}`;
    
    if (lastUpdatedEl && this.lastUpdated) {
      lastUpdatedEl.textContent = this.lastUpdated.toLocaleTimeString();
    }
  }
};

// UI组件模块
const uiComponents = {
  renderItems(items) {
    const itemsList = document.getElementById('items-list');
    const emptyState = document.getElementById('empty-state');
    const itemsCount = document.getElementById('items-count');
    
    if (!itemsList || !emptyState || !itemsCount) {
      console.error('Required DOM elements not found');
      return;
    }
    
    if (items.length === 0) {
      itemsList.innerHTML = '';
      emptyState.classList.remove('hidden');
      itemsList.appendChild(emptyState);
      itemsCount.textContent = '0 items';
      return;
    }
    
    emptyState.classList.add('hidden');
    itemsList.innerHTML = '';
    itemsCount.textContent = `${items.length} item${items.length > 1 ? 's' : ''}`;
    
    items.forEach((item, index) => {
      const itemElement = document.createElement('div');
      itemElement.className = 'bg-white p-4 rounded-lg border border-gray-100 hover:shadow-sm transition-shadow relative fade-in';
      itemElement.style.animationDelay = `${0.05 * index}s`;
      
      const priceDisplay = item.price 
        ? `<span class="text-sm font-medium text-dark">$${parseFloat(item.price).toFixed(2)}</span>`
        : '<span class="text-sm text-gray-400">No price</span>';
      
      itemElement.innerHTML = `
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <h3 class="font-medium text-dark">${item.name}</h3>
            <p class="text-sm text-gray-500 mt-1">${item.description || 'No description'}</p>
          </div>
          ${priceDisplay}
        </div>
        <div class="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button class="edit-item p-1 text-gray-500 hover:text-primary" data-id="${item.item_id}">
            <i class="fa-solid fa-pencil"></i>
          </button>
          <button class="delete-item p-1 text-gray-500 hover:text-red-500 ml-1" data-id="${item.item_id}">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
        <div class="absolute top-0 left-0 w-1 h-full ${item.price ? 'bg-green-500' : 'bg-gray-300'} rounded-l-lg"></div>
      `;
      
      itemsList.appendChild(itemElement);
    });
    
    // 添加编辑和删除事件监听器
    document.querySelectorAll('.edit-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const itemId = e.currentTarget.getAttribute('data-id');
        this.showEditModal(itemId);
      });
    });
    
    document.querySelectorAll('.delete-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const itemId = e.currentTarget.getAttribute('data-id');
        this.confirmDelete(itemId);
      });
    });
  },
  
  updateConnectionStatus(connected) {
    appState.isConnected = connected;
    const statusIndicator = document.getElementById('connection-status');
    const statusText = statusIndicator?.parentElement?.querySelector('p');
    const statusCard = document.getElementById('status-indicator');
    
    if (statusIndicator) {
      statusIndicator.className = connected 
        ? 'w-3 h-3 rounded-full bg-green-500' 
        : 'w-3 h-3 rounded-full bg-red-500';
    }
    
    if (statusText) {
      statusText.textContent = connected 
        ? 'Connected to backend' 
        : 'Connection to backend failed';
    }
    
    if (statusCard) {
      statusCard.className = connected 
        ? 'mb-6 card bg-green-50' 
        : 'mb-6 card bg-red-50';
    }
  },
  
  showNotification(message, type = 'success') {
    const container = document.getElementById('notification-container');
    if (!container) {
      console.error('Notification container not found');
      return;
    }
    
    const notification = document.createElement('div');
    notification.className = `flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg mb-3 transform transition-all duration-300 translate-y-10 opacity-0 ${
      type === 'success' ? 'bg-green-500 text-white' : 
      type === 'error' ? 'bg-red-500 text-white' : 
      'bg-blue-500 text-white'
    }`;
    
    notification.innerHTML = `
      <i class="fa-solid ${
        type === 'success' ? 'fa-check-circle' : 
        type === 'error' ? 'fa-exclamation-circle' : 
        'fa-info-circle'
      }"></i>
      <span>${message}</span>
    `;
    
    container.appendChild(notification);
    
    // 显示通知
    setTimeout(() => {
      notification.classList.remove('translate-y-10', 'opacity-0');
    }, 10);
    
    // 自动关闭
    setTimeout(() => {
      notification.classList.add('translate-y-10', 'opacity-0');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  },
  
  showEditModal(itemId) {
    const item = appState.items.find(i => i.item_id === itemId);
    if (!item) return;
    
    // 创建编辑模态框
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 opacity-0 transition-opacity duration-300';
    modal.innerHTML = `
      <div class="bg-white rounded-xl shadow-lg w-full max-w-md p-6 transform transition-transform duration-300 scale-95">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-dark">Edit Item</h3>
          <button class="close-modal text-gray-500 hover:text-gray-700">
            <i class="fa-solid fa-times"></i>
          </button>
        </div>
        <form id="edit-item-form" class="space-y-4">
          <input type="hidden" id="edit-item-id" value="${item.item_id}">
          <div>
            <label for="edit-item-name" class="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input type="text" id="edit-item-name" value="${item.name}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
          </div>
          <div>
            <label for="edit-item-description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea id="edit-item-description" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">${item.description || ''}</textarea>
          </div>
          <div>
            <label for="edit-item-price" class="block text-sm font-medium text-gray-700 mb-1">Price</label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input type="number" id="edit-item-price" min="0" step="0.01" value="${item.price || ''}" class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
            </div>
          </div>
          <div class="flex justify-end gap-2">
            <button type="button" class="btn-secondary close-modal">Cancel</button>
            <button type="submit" class="btn-primary">Save Changes</button>
          </div>
        </form>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // 显示模态框
    setTimeout(() => {
      modal.classList.remove('opacity-0');
      modal.querySelector('div').classList.remove('scale-95');
      modal.querySelector('div').classList.add('scale-100');
    }, 10);
    
    // 关闭模态框
    const closeModal = () => {
      modal.classList.add('opacity-0');
      modal.querySelector('div').classList.remove('scale-100');
      modal.querySelector('div').classList.add('scale-95');
      setTimeout(() => modal.remove(), 300);
    };
    
    modal.querySelectorAll('.close-modal').forEach(btn => {
      btn.addEventListener('click', closeModal);
    });
    
    // 提交表单
    const editForm = modal.querySelector('#edit-item-form');
    editForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const itemId = document.getElementById('edit-item-id').value;
      const name = document.getElementById('edit-item-name').value.trim();
      const description = document.getElementById('edit-item-description').value.trim() || undefined;
      const price = document.getElementById('edit-item-price').value.trim() || undefined;
      
      if (!name) {
        alert('Name is required');
        return;
      }
      
      try {
        const updatedItem = await apiService.updateItem(itemId, { name, description, price });
        const index = appState.items.findIndex(i => i.item_id === itemId);
        if (index !== -1) {
          appState.items[index] = updatedItem;
          appState.filterItems(document.getElementById('search-input').value);
          this.renderItems(appState.filteredItems);
          this.showNotification('Item updated successfully');
        }
        closeModal();
      } catch (error) {
        this.showNotification(`Failed to update item: ${error.message}`, 'error');
      }
    });
  },
  
  confirmDelete(itemId) {
    const item = appState.items.find(i => i.item_id === itemId);
    if (!item) return;
    
    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
      this.deleteItem(itemId);
    }
  },
  
  async deleteItem(itemId) {
    try {
      await apiService.deleteItem(itemId);
      appState.items = appState.items.filter(i => i.item_id !== itemId);
      appState.filterItems(document.getElementById('search-input').value);
      this.renderItems(appState.filteredItems);
      this.showNotification('Item deleted successfully');
    } catch (error) {
      this.showNotification(`Failed to delete item: ${error.message}`, 'error');
    }
  }
};

// 初始化应用
async function initApp() {
  try {
    // 测试后端连接
    await apiService.fetchItems();
    uiComponents.updateConnectionStatus(true);
    uiComponents.showNotification('Connected to backend');
  } catch (error) {
    uiComponents.updateConnectionStatus(false);
    uiComponents.showNotification(`Failed to connect to backend: ${error.message}`, 'error');
    console.error('Backend connection error:', error);
  }
  
  // 加载项目列表
  await refreshItems();
  
  // 设置定时刷新
  setInterval(refreshItems, 10000);
  
  // 初始化表单提交事件
  const createForm = document.getElementById('create-item-form');
  if (createForm) {
    createForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const nameInput = document.getElementById('item-name');
      const descriptionInput = document.getElementById('item-description');
      const priceInput = document.getElementById('item-price');
      
      const name = nameInput.value.trim();
      const description = descriptionInput.value.trim() || undefined;
      const price = priceInput.value.trim() || undefined;
      
      // 验证
      const nameError = document.getElementById('name-error');
      if (!name) {
        if (nameError) nameError.classList.remove('hidden');
        nameInput.classList.add('border-red-500');
        nameInput.focus();
        return;
      } else {
        if (nameError) nameError.classList.add('hidden');
        nameInput.classList.remove('border-red-500');
      }
      
      try {
        const newItem = await apiService.createItem({ name, description, price });
        appState.items.push(newItem);
        appState.filterItems(document.getElementById('search-input').value);
        uiComponents.renderItems(appState.filteredItems);
        
        // 重置表单
        nameInput.value = '';
        descriptionInput.value = '';
        priceInput.value = '';
        nameInput.focus();
        
        // 显示成功通知
        uiComponents.showNotification('Item created successfully');
      } catch (error) {
        uiComponents.showNotification(`Failed to create item: ${error.message}`, 'error');
      }
    });
  } else {
    console.error('Create form not found');
  }
  
  // 搜索功能
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      appState.filterItems(e.target.value);
      uiComponents.renderItems(appState.filteredItems);
    });
  } else {
    console.error('Search input not found');
  }
  
  // 刷新按钮
  const refreshBtn = document.getElementById('refresh-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', refreshItems);
  } else {
    console.error('Refresh button not found');
  }
}

// 刷新项目列表
async function refreshItems() {
  try {
    const items = await apiService.fetchItems();
    appState.setItems(items);
    uiComponents.renderItems(appState.filteredItems);
    if (appState.isConnected) {
      uiComponents.showNotification('Data refreshed', 'info');
    }
  } catch (error) {
    uiComponents.updateConnectionStatus(false);
    uiComponents.showNotification(`Failed to refresh data: ${error.message}`, 'error');
    console.error('Refresh error:', error);
  }
}

// 启动应用
document.addEventListener('DOMContentLoaded', initApp);  