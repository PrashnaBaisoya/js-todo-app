# TaskFlow — JavaScript Logic & State Management

An interactive, client-side To-Do List application built with Vanilla JavaScript (ES6+), semantic HTML5, and modern CSS3.

## Features Implemented
* **Full CRUD Operations:** Create tasks, read/render dynamic DOM nodes, edit task text inline, toggle completion status, and delete individual or completed tasks.
* **Persistent State (`window.localStorage`):** Automatically synchronizes application state to `localStorage` so tasks remain intact across browser reloads.
* **Advanced Filtering:** Instant view switching between **All**, **Active**, and **Completed** tasks along with a live active task counter.
* **Event Delegation:** Uses single delegated event listeners on parent containers (`#task-list` and `#filter-buttons`) instead of attaching individual listeners to every dynamic element.