/**
 * TaskFlow Frontend Application Logic
 */

// Configuration & API Endpoint Detection
const API_BASE = window.location.origin.startsWith('http') 
  ? '/api' 
  : 'http://localhost:3000/api';

// Application State
const state = {
  tasks: [],
  filterStatus: 'all',
  filterPriority: 'all',
  searchQuery: '',
  sortBy: 'newest',
  editingTaskId: null,
  taskToDelete: null,
  isBackendAvailable: false,
  dataSource: 'connecting'
};

// DOM Element References
const elements = {
  // Theme & Status
  themeToggleBtn: document.getElementById('themeToggleBtn'),
  connectionStatus: document.getElementById('connectionStatus'),
  
  // Stats
  statTotal: document.getElementById('statTotal'),
  statPending: document.getElementById('statPending'),
  statInProgress: document.getElementById('statInProgress'),
  statCompleted: document.getElementById('statCompleted'),
  completionRateFill: document.getElementById('completionRateFill'),
  completionRateText: document.getElementById('completionRateText'),
  tasksCountBadge: document.getElementById('tasksCountBadge'),
  
  // Controls & Filters
  searchInput: document.getElementById('searchInput'),
  clearSearchBtn: document.getElementById('clearSearchBtn'),
  tabButtons: document.querySelectorAll('.tab-btn'),
  priorityFilter: document.getElementById('priorityFilter'),
  sortOrder: document.getElementById('sortOrder'),
  refreshBtn: document.getElementById('refreshBtn'),
  
  // Container & Empty State
  tasksContainer: document.getElementById('tasksContainer'),
  emptyState: document.getElementById('emptyState'),
  emptyStateSubtitle: document.getElementById('emptyStateSubtitle'),
  emptyCreateBtn: document.getElementById('emptyCreateBtn'),
  
  // Task Modal
  taskModal: document.getElementById('taskModal'),
  modalBackdrop: document.getElementById('modalBackdrop'),
  modalTitle: document.getElementById('modalTitle'),
  taskForm: document.getElementById('taskForm'),
  taskId: document.getElementById('taskId'),
  taskTitle: document.getElementById('taskTitle'),
  taskDescription: document.getElementById('taskDescription'),
  taskPriority: document.getElementById('taskPriority'),
  taskStatus: document.getElementById('taskStatus'),
  taskDueDate: document.getElementById('taskDueDate'),
  openNewTaskBtn: document.getElementById('openNewTaskBtn'),
  closeModalBtn: document.getElementById('closeModalBtn'),
  cancelModalBtn: document.getElementById('cancelModalBtn'),
  saveBtnText: document.getElementById('saveBtnText'),
  
  // Delete Modal
  deleteModal: document.getElementById('deleteModal'),
  deleteModalBackdrop: document.getElementById('deleteModalBackdrop'),
  deleteTaskTitle: document.getElementById('deleteTaskTitle'),
  closeDeleteModalBtn: document.getElementById('closeDeleteModalBtn'),
  cancelDeleteBtn: document.getElementById('cancelDeleteBtn'),
  confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),
  
  // Toast
  toastContainer: document.getElementById('toastContainer')
};

// ==========================================================================
// Initialization
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  setupEventListeners();
  checkHealthAndLoadTasks();
  
  // Periodic background health check every 15s
  setInterval(checkHealth, 15000);
});

function initTheme() {
  const savedTheme = localStorage.getItem('taskflow_theme') || 'dark';
  document.body.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

function updateThemeIcon(theme) {
  const icon = elements.themeToggleBtn.querySelector('i');
  if (theme === 'light') {
    icon.className = 'fa-solid fa-sun';
  } else {
    icon.className = 'fa-solid fa-moon';
  }
}

// ==========================================================================
// Event Listeners Setup
// ==========================================================================

function setupEventListeners() {
  // Theme Toggle
  elements.themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.body.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('taskflow_theme', newTheme);
    updateThemeIcon(newTheme);
  });

  // Modal Triggers
  elements.openNewTaskBtn.addEventListener('click', () => openTaskModal());
  elements.emptyCreateBtn.addEventListener('click', () => openTaskModal());
  elements.closeModalBtn.addEventListener('click', closeTaskModal);
  elements.cancelModalBtn.addEventListener('click', closeTaskModal);
  elements.modalBackdrop.addEventListener('click', closeTaskModal);

  // Form Submit
  elements.taskForm.addEventListener('submit', handleTaskFormSubmit);

  // Delete Modal Triggers
  elements.closeDeleteModalBtn.addEventListener('click', closeDeleteModal);
  elements.cancelDeleteBtn.addEventListener('click', closeDeleteModal);
  elements.deleteModalBackdrop.addEventListener('click', closeDeleteModal);
  elements.confirmDeleteBtn.addEventListener('click', handleConfirmDelete);

  // Status Tabs
  elements.tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      elements.tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.filterStatus = btn.dataset.status;
      renderTasks();
    });
  });

  // Priority Filter
  elements.priorityFilter.addEventListener('change', (e) => {
    state.filterPriority = e.target.value;
    renderTasks();
  });

  // Sort Order
  elements.sortOrder.addEventListener('change', (e) => {
    state.sortBy = e.target.value;
    renderTasks();
  });

  // Search Input with Debounce
  let searchTimeout;
  elements.searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const value = e.target.value.trim();
    elements.clearSearchBtn.style.display = value ? 'block' : 'none';
    searchTimeout = setTimeout(() => {
      state.searchQuery = value;
      renderTasks();
    }, 200);
  });

  elements.clearSearchBtn.addEventListener('click', () => {
    elements.searchInput.value = '';
    elements.clearSearchBtn.style.display = 'none';
    state.searchQuery = '';
    renderTasks();
  });

  // Refresh Button
  elements.refreshBtn.addEventListener('click', async () => {
    const icon = elements.refreshBtn.querySelector('i');
    icon.classList.add('fa-spin');
    await checkHealthAndLoadTasks();
    setTimeout(() => icon.classList.remove('fa-spin'), 600);
  });

  // Global Keydown (Esc to close modal, / to focus search)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeTaskModal();
      closeDeleteModal();
    } else if (e.key === '/' && document.activeElement !== elements.searchInput && !elements.taskModal.classList.contains('active')) {
      e.preventDefault();
      elements.searchInput.focus();
    }
  });

  // Stat Cards Click to Filter
  document.querySelectorAll('.stat-card').forEach(card => {
    card.addEventListener('click', () => {
      const targetFilter = card.dataset.filter;
      if (targetFilter) {
        state.filterStatus = targetFilter;
        elements.tabButtons.forEach(btn => {
          btn.classList.toggle('active', btn.dataset.status === targetFilter);
        });
        renderTasks();
      }
    });
  });
}

// ==========================================================================
// Health & API Connection
// ==========================================================================

async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      state.isBackendAvailable = true;
      if (data.database === 'mysql-connected') {
        updateStatusPill('online', 'MySQL Connected');
      } else {
        updateStatusPill('memory', 'In-Memory Mode');
      }
      return true;
    }
  } catch (err) {
    // API server is unreachable
  }

  state.isBackendAvailable = false;
  updateStatusPill('error', 'Offline (Local Storage)');
  return false;
}

function updateStatusPill(type, text) {
  elements.connectionStatus.className = `status-pill status-${type}`;
  elements.connectionStatus.querySelector('.status-text').textContent = text;
}

async function checkHealthAndLoadTasks() {
  await checkHealth();
  await fetchTasks();
}

// ==========================================================================
// Data Fetching & Sync
// ==========================================================================

async function fetchTasks() {
  if (state.isBackendAvailable) {
    try {
      const res = await fetch(`${API_BASE}/tasks`);
      if (res.ok) {
        const json = await res.json();
        state.tasks = json.data || [];
        localStorage.setItem('taskflow_backup', JSON.stringify(state.tasks));
        renderTasks();
        return;
      }
    } catch (err) {
      console.warn('Backend fetch failed, falling back to local cache:', err.message);
    }
  }

  // Fallback to local storage or defaults
  const cached = localStorage.getItem('taskflow_backup');
  if (cached) {
    try {
      state.tasks = JSON.parse(cached);
    } catch (e) {
      state.tasks = getInitialDefaultTasks();
    }
  } else {
    state.tasks = getInitialDefaultTasks();
    localStorage.setItem('taskflow_backup', JSON.stringify(state.tasks));
  }

  renderTasks();
}

function getInitialDefaultTasks() {
  return [
    {
      id: 1,
      title: 'Initialize Project Repository',
      description: 'Set up GitHub repository, CI/CD pipelines, and project directory structure.',
      status: 'completed',
      priority: 'high',
      due_date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      title: 'Design UI / UX Mockups',
      description: 'Create responsive design system, color palette, dark mode styles, and wireframes.',
      status: 'completed',
      priority: 'medium',
      due_date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      title: 'Build Express REST API',
      description: 'Implement CRUD endpoints for task management with PostgreSQL integration.',
      status: 'in-progress',
      priority: 'high',
      due_date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      created_at: new Date().toISOString()
    },
    {
      id: 4,
      title: 'Implement Frontend State Management',
      description: 'Connect JavaScript frontend to backend API with offline fallback support.',
      status: 'in-progress',
      priority: 'urgent',
      due_date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      created_at: new Date().toISOString()
    },
    {
      id: 5,
      title: 'Configure Docker Containers',
      description: 'Create Dockerfile and docker-compose.yml for seamless multi-container orchestration.',
      status: 'pending',
      priority: 'medium',
      due_date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      created_at: new Date().toISOString()
    }
  ];
}

// ==========================================================================
// Rendering & Filtering Logic
// ==========================================================================

function renderTasks() {
  updateStats();

  let filtered = [...state.tasks];

  // 1. Status Filter
  if (state.filterStatus !== 'all') {
    filtered = filtered.filter(t => t.status === state.filterStatus);
  }

  // 2. Priority Filter
  if (state.filterPriority !== 'all') {
    filtered = filtered.filter(t => t.priority === state.filterPriority);
  }

  // 3. Search Query
  if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase();
    filtered = filtered.filter(t => 
      t.title.toLowerCase().includes(q) || 
      (t.description && t.description.toLowerCase().includes(q))
    );
  }

  // 4. Sorting
  const priorityWeight = { urgent: 4, high: 3, medium: 2, low: 1 };
  filtered.sort((a, b) => {
    switch (state.sortBy) {
      case 'newest':
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      case 'oldest':
        return new Date(a.created_at || 0) - new Date(b.created_at || 0);
      case 'due_asc':
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date) - new Date(b.due_date);
      case 'due_desc':
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(b.due_date) - new Date(a.due_date);
      case 'priority':
        return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
      default:
        return 0;
    }
  });

  // Update badge count
  elements.tasksCountBadge.textContent = filtered.length;

  // Render cards or empty state
  if (filtered.length === 0) {
    elements.tasksContainer.innerHTML = '';
    elements.emptyState.style.display = 'block';
    if (state.searchQuery) {
      elements.emptyStateSubtitle.textContent = `No tasks matching "${state.searchQuery}"`;
    } else {
      elements.emptyStateSubtitle.textContent = "You don't have any tasks matching the current filters.";
    }
  } else {
    elements.emptyState.style.display = 'none';
    elements.tasksContainer.innerHTML = filtered.map(task => createTaskCardHTML(task)).join('');
    attachCardEventListeners();
  }
}

function createTaskCardHTML(task) {
  const isCompleted = task.status === 'completed';
  const priority = task.priority || 'medium';
  const status = task.status || 'pending';
  
  // Date calculation
  let dateHTML = '';
  if (task.due_date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.due_date + 'T00:00:00');
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let dateClass = 'meta-item';
    let dateLabel = dueDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

    if (!isCompleted) {
      if (diffDays < 0) {
        dateClass += ' overdue';
        dateLabel += ` (${Math.abs(diffDays)}d overdue)`;
      } else if (diffDays === 0) {
        dateClass += ' due-today';
        dateLabel += ' (Due Today)';
      }
    }

    dateHTML = `
      <div class="${dateClass}">
        <i class="fa-regular fa-calendar"></i>
        <span>${dateLabel}</span>
      </div>
    `;
  }

  const statusLabels = {
    'pending': 'Pending',
    'in-progress': 'In Progress',
    'completed': 'Completed'
  };

  return `
    <article class="task-card ${isCompleted ? 'completed' : ''}" data-id="${task.id}" data-priority="${priority}">
      <div class="task-checkbox-wrap">
        <button class="custom-checkbox task-toggle-btn" title="${isCompleted ? 'Mark as Pending' : 'Mark as Completed'}" aria-label="Toggle task status">
          <i class="fa-solid fa-check"></i>
        </button>
      </div>

      <div class="task-content">
        <div class="task-top-row">
          <h3 class="task-title">${escapeHTML(task.title)}</h3>
          <div class="task-badges">
            <span class="badge badge-priority-${priority}">${priority}</span>
            <span class="badge badge-status-${status}">${statusLabels[status] || status}</span>
          </div>
        </div>

        ${task.description ? `<p class="task-desc">${escapeHTML(task.description)}</p>` : ''}

        <div class="task-meta-row">
          <div class="meta-tags">
            ${dateHTML}
            <div class="meta-item">
              <i class="fa-regular fa-clock"></i>
              <span>Created ${formatRelativeTime(task.created_at)}</span>
            </div>
          </div>

          <div class="task-actions">
            <button class="action-btn edit-task-btn" title="Edit task" aria-label="Edit task">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="action-btn delete-btn delete-task-btn" title="Delete task" aria-label="Delete task">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>
      </div>
    </article>
  `;
}

function attachCardEventListeners() {
  // Toggle status
  document.querySelectorAll('.task-toggle-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.task-card');
      const id = parseInt(card.dataset.id, 10);
      toggleTaskStatus(id);
    });
  });

  // Edit task
  document.querySelectorAll('.edit-task-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.task-card');
      const id = parseInt(card.dataset.id, 10);
      openTaskModal(id);
    });
  });

  // Delete task
  document.querySelectorAll('.delete-task-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.task-card');
      const id = parseInt(card.dataset.id, 10);
      openDeleteModal(id);
    });
  });
}

function updateStats() {
  const total = state.tasks.length;
  const pending = state.tasks.filter(t => t.status === 'pending').length;
  const inProgress = state.tasks.filter(t => t.status === 'in-progress').length;
  const completed = state.tasks.filter(t => t.status === 'completed').length;
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

  elements.statTotal.textContent = total;
  elements.statPending.textContent = pending;
  elements.statInProgress.textContent = inProgress;
  elements.statCompleted.textContent = completed;
  elements.completionRateFill.style.width = `${rate}%`;
  elements.completionRateText.textContent = `${rate}% Done`;
}

// ==========================================================================
// Task Actions: Create, Update, Toggle, Delete
// ==========================================================================

async function toggleTaskStatus(id) {
  const task = state.tasks.find(t => t.id === id);
  if (!task) return;

  const newStatus = task.status === 'completed' ? 'pending' : 'completed';
  const oldStatus = task.status;
  task.status = newStatus;
  task.updated_at = new Date().toISOString();

  // Optimistic UI update
  renderTasks();

  if (state.isBackendAvailable) {
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update status on server');
      showToast(newStatus === 'completed' ? 'Task marked as completed!' : 'Task restored to pending', 'success');
      return;
    } catch (err) {
      console.error(err);
      showToast('Offline: updated locally only', 'info');
    }
  }

  // Backup locally
  localStorage.setItem('taskflow_backup', JSON.stringify(state.tasks));
  showToast(newStatus === 'completed' ? 'Task completed (Local)' : 'Task restored (Local)', 'success');
}

function openTaskModal(taskId = null) {
  state.editingTaskId = taskId;
  elements.taskForm.reset();

  if (taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    elements.modalTitle.textContent = 'Edit Task';
    elements.saveBtnText.textContent = 'Save Changes';
    elements.taskId.value = task.id;
    elements.taskTitle.value = task.title;
    elements.taskDescription.value = task.description || '';
    elements.taskPriority.value = task.priority || 'medium';
    elements.taskStatus.value = task.status || 'pending';
    elements.taskDueDate.value = task.due_date ? task.due_date.split('T')[0] : '';
  } else {
    elements.modalTitle.textContent = 'Create New Task';
    elements.saveBtnText.textContent = 'Create Task';
    elements.taskId.value = '';
    elements.taskPriority.value = 'medium';
    elements.taskStatus.value = 'pending';
  }

  elements.taskModal.classList.add('active');
  elements.taskModal.setAttribute('aria-hidden', 'false');
  setTimeout(() => elements.taskTitle.focus(), 100);
}

function closeTaskModal() {
  elements.taskModal.classList.remove('active');
  elements.taskModal.setAttribute('aria-hidden', 'true');
  state.editingTaskId = null;
}

async function handleTaskFormSubmit(e) {
  e.preventDefault();
  const title = elements.taskTitle.value.trim();
  const description = elements.taskDescription.value.trim();
  const priority = elements.taskPriority.value;
  const status = elements.taskStatus.value;
  const dueDate = elements.taskDueDate.value || null;

  if (!title) return;

  const payload = { title, description, priority, status, due_date: dueDate };

  if (state.editingTaskId) {
    // Update existing task
    if (state.isBackendAvailable) {
      try {
        const res = await fetch(`${API_BASE}/tasks/${state.editingTaskId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const json = await res.json();
          const idx = state.tasks.findIndex(t => t.id === state.editingTaskId);
          if (idx !== -1) state.tasks[idx] = json.data;
          closeTaskModal();
          renderTasks();
          showToast('Task updated successfully!', 'success');
          return;
        }
      } catch (err) {
        console.error(err);
      }
    }

    // Local fallback update
    const idx = state.tasks.findIndex(t => t.id === state.editingTaskId);
    if (idx !== -1) {
      state.tasks[idx] = { ...state.tasks[idx], ...payload, updated_at: new Date().toISOString() };
      localStorage.setItem('taskflow_backup', JSON.stringify(state.tasks));
      closeTaskModal();
      renderTasks();
      showToast('Task updated locally', 'success');
    }
  } else {
    // Create new task
    if (state.isBackendAvailable) {
      try {
        const res = await fetch(`${API_BASE}/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const json = await res.json();
          state.tasks.unshift(json.data);
          closeTaskModal();
          renderTasks();
          showToast('New task created!', 'success');
          return;
        }
      } catch (err) {
        console.error(err);
      }
    }

    // Local fallback create
    const newTask = {
      id: Date.now(),
      ...payload,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    state.tasks.unshift(newTask);
    localStorage.setItem('taskflow_backup', JSON.stringify(state.tasks));
    closeTaskModal();
    renderTasks();
    showToast('Task created locally', 'success');
  }
}

function openDeleteModal(id) {
  const task = state.tasks.find(t => t.id === id);
  if (!task) return;
  state.taskToDelete = task;
  elements.deleteTaskTitle.textContent = `"${task.title}"`;
  elements.deleteModal.classList.add('active');
  elements.deleteModal.setAttribute('aria-hidden', 'false');
}

function closeDeleteModal() {
  elements.deleteModal.classList.remove('active');
  elements.deleteModal.setAttribute('aria-hidden', 'true');
  state.taskToDelete = null;
}

async function handleConfirmDelete() {
  if (!state.taskToDelete) return;
  const id = state.taskToDelete.id;

  if (state.isBackendAvailable) {
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' });
      if (res.ok) {
        state.tasks = state.tasks.filter(t => t.id !== id);
        closeDeleteModal();
        renderTasks();
        showToast('Task deleted successfully', 'info');
        return;
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Local fallback delete
  state.tasks = state.tasks.filter(t => t.id !== id);
  localStorage.setItem('taskflow_backup', JSON.stringify(state.tasks));
  closeDeleteModal();
  renderTasks();
  showToast('Task deleted locally', 'info');
}

// ==========================================================================
// Toast Notification Utility
// ==========================================================================

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconClass = type === 'success' 
    ? 'fa-circle-check' 
    : type === 'error' 
      ? 'fa-triangle-exclamation' 
      : 'fa-circle-info';

  toast.innerHTML = `
    <i class="fa-solid ${iconClass} toast-icon"></i>
    <span>${escapeHTML(message)}</span>
  `;

  elements.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// ==========================================================================
// Helpers & Utilities
// ==========================================================================

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

function formatRelativeTime(dateString) {
  if (!dateString) return 'recently';
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 60) return 'just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
