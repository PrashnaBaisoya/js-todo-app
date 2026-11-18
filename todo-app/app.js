// ==========================================================================
// Centralized Application State & Storage Key
// ==========================================================================
const STORAGE_KEY = 'taskflow_todos_v1';

let state = {
  tasks: JSON.parse(localStorage.getItem(STORAGE_KEY)) || [],
  filter: 'all', // 'all' | 'active' | 'completed'
  editingId: null
};

// ==========================================================================
// DOM References
// ==========================================================================
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const filterButtons = document.getElementById('filter-buttons');
const clearCompletedBtn = document.getElementById('clear-completed');
const taskCounter = document.getElementById('task-counter');
const emptyState = document.getElementById('empty-state');

// ==========================================================================
// State Persistence Helper
// ==========================================================================
function saveAndRender() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
  render();
}

// ==========================================================================
// CRUD Operations (Create, Read/Filter, Update, Delete)
// ==========================================================================
function createTask(text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  const newTask = {
    id: Date.now().toString(),
    text: trimmed,
    completed: false
  };

  state.tasks.unshift(newTask);
  saveAndRender();
}

function toggleTaskStatus(id) {
  state.tasks = state.tasks.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  saveAndRender();
}

function startEditingTask(id) {
  state.editingId = id;
  render();
}

function updateTaskText(id, newText) {
  const trimmed = newText.trim();
  if (!trimmed) {
    deleteTask(id);
    return;
  }

  state.tasks = state.tasks.map((task) =>
    task.id === id ? { ...task, text: trimmed } : task
  );
  state.editingId = null;
  saveAndRender();
}

function deleteTask(id) {
  state.tasks = state.tasks.filter((task) => task.id !== id);
  if (state.editingId === id) state.editingId = null;
  saveAndRender();
}

function clearCompletedTasks() {
  state.tasks = state.tasks.filter((task) => !task.completed);
  saveAndRender();
}

function getFilteredTasks() {
  if (state.filter === 'active') {
    return state.tasks.filter((task) => !task.completed);
  }
  if (state.filter === 'completed') {
    return state.tasks.filter((task) => task.completed);
  }
  return state.tasks;
}

// ==========================================================================
// Dynamic DOM Rendering
// ==========================================================================
function render() {
  const visibleTasks = getFilteredTasks();
  const activeCount = state.tasks.filter((t) => !t.completed).length;

  taskCounter.textContent = `${activeCount} ${activeCount === 1 ? 'task' : 'tasks'} left`;
  taskList.innerHTML = '';

  if (visibleTasks.length === 0) {
    emptyState.hidden = false;
  } else {
    emptyState.hidden = true;
  }

  visibleTasks.forEach((task) => {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;
    li.dataset.id = task.id;

    const leftDiv = document.createElement('div');
    leftDiv.className = 'task-left';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = task.completed;
    checkbox.dataset.action = 'toggle';
    checkbox.setAttribute('aria-label', `Mark "${task.text}" as ${task.completed ? 'active' : 'completed'}`);

    leftDiv.appendChild(checkbox);

    if (state.editingId === task.id) {
      const editInput = document.createElement('input');
      editInput.type = 'text';
      editInput.className = 'edit-input';
      editInput.value = task.text;
      editInput.dataset.action = 'edit-input';
      leftDiv.appendChild(editInput);
      setTimeout(() => editInput.focus(), 0);
    } else {
      const span = document.createElement('span');
      span.className = 'task-text';
      span.textContent = task.text;
      leftDiv.appendChild(span);
    }

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'task-actions';

    if (state.editingId === task.id) {
      const saveBtn = document.createElement('button');
      saveBtn.type = 'button';
      saveBtn.className = 'action-btn';
      saveBtn.textContent = 'Save';
      saveBtn.dataset.action = 'save';
      actionsDiv.appendChild(saveBtn);
    } else {
      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'action-btn';
      editBtn.textContent = 'Edit';
      editBtn.dataset.action = 'edit';
      actionsDiv.appendChild(editBtn);
    }

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'action-btn delete';
    deleteBtn.textContent = 'Delete';
    deleteBtn.dataset.action = 'delete';
    actionsDiv.appendChild(deleteBtn);

    li.appendChild(leftDiv);
    li.appendChild(actionsDiv);
    taskList.appendChild(li);
  });
}

// ==========================================================================
// Event Listeners & Event Delegation
// ==========================================================================
taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  createTask(taskInput.value);
  taskInput.value = '';
  taskInput.focus();
});

// Delegated listener on the parent <ul> for toggle, edit, save, and delete
taskList.addEventListener('click', (e) => {
  const action = e.target.dataset.action;
  if (!action) return;

  const taskItem = e.target.closest('.task-item');
  if (!taskItem) return;
  const id = taskItem.dataset.id;

  if (action === 'toggle') {
    toggleTaskStatus(id);
  } else if (action === 'edit') {
    startEditingTask(id);
  } else if (action === 'save') {
    const input = taskItem.querySelector('.edit-input');
    if (input) updateTaskText(id, input.value);
  } else if (action === 'delete') {
    deleteTask(id);
  }
});

// Support pressing Enter to save while editing inline
taskList.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.target.dataset.action === 'edit-input') {
    const taskItem = e.target.closest('.task-item');
    if (taskItem) updateTaskText(taskItem.dataset.id, e.target.value);
  }
});

// Delegated listener on the filter container
filterButtons.addEventListener('click', (e) => {
  const btn = e.target.closest('.filter-btn');
  if (!btn) return;

  state.filter = btn.dataset.filter;
  document.querySelectorAll('.filter-btn').forEach((b) => {
    const isActive = b === btn;
    b.classList.toggle('active', isActive);
    b.setAttribute('aria-pressed', isActive);
  });
  render();
});

clearCompletedBtn.addEventListener('click', clearCompletedTasks);

// Initial render on page load
render();