const express = require('express');
const router = express.Router();

// Fallback in-memory store if MySQL database is offline
let inMemoryTasks = [
  {
    id: 1,
    title: 'Submit Cloud Computing lab record (Unit 3 & 4)',
    description: 'Get sign-off from lab assistant and attach screenshot of AWS VPC architecture.',
    status: 'pending',
    priority: 'urgent',
    due_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    title: 'Prepare presentation slides for Minor Project viva',
    description: 'Include architecture diagram, Docker Compose flow, and CI/CD pipeline steps.',
    status: 'in-progress',
    priority: 'high',
    due_date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    title: 'Review MySQL indexing and Docker networking questions',
    description: 'Prepare answers for viva voce on container communication and volume persistence.',
    status: 'pending',
    priority: 'medium',
    due_date: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 4,
    title: 'Schedule project review with guide Dr. Sharma',
    description: 'Discuss EC2 free-tier hosting and demo recording for final evaluation.',
    status: 'pending',
    priority: 'medium',
    due_date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 5,
    title: 'Buy project file binder and print synopsis draft',
    description: 'Print 2 copies of abstract and system requirement specifications.',
    status: 'completed',
    priority: 'low',
    due_date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 6,
    title: 'Set up GitHub repository and push initial code',
    description: 'Initialized git repository with main branch and added .gitignore.',
    status: 'completed',
    priority: 'high',
    due_date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  }
];
let nextId = 7;

// Helper to access DB pool
const getPool = (req) => req.app.get('dbPool');

// GET /api/tasks (list all tasks with search & filter)
router.get('/', async (req, res) => {
  const pool = getPool(req);
  const { status, priority, search } = req.query;

  if (pool) {
    try {
      let query = 'SELECT * FROM tasks WHERE 1=1';
      const params = [];

      if (status && status !== 'all') {
        query += ' AND status = ?';
        params.push(status);
      }

      if (priority && priority !== 'all') {
        query += ' AND priority = ?';
        params.push(priority);
      }

      if (search) {
        query += ' AND (title LIKE ? OR description LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }

      query += ' ORDER BY created_at DESC';

      const [rows] = await pool.query(query, params);
      return res.json({ success: true, count: rows.length, data: rows, source: 'mysql' });
    } catch (err) {
      console.error('MySQL query error, using memory fallback:', err.message);
    }
  }

  // Fallback in-memory filtering
  let filtered = [...inMemoryTasks];
  if (status && status !== 'all') {
    filtered = filtered.filter(t => t.status === status);
  }
  if (priority && priority !== 'all') {
    filtered = filtered.filter(t => t.priority === priority);
  }
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(t => 
      t.title.toLowerCase().includes(s) || 
      (t.description && t.description.toLowerCase().includes(s))
    );
  }
  filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  res.json({ success: true, count: filtered.length, data: filtered, source: 'memory' });
});

// GET /api/tasks/:id (single task)
router.get('/:id', async (req, res) => {
  const pool = getPool(req);
  const taskId = parseInt(req.params.id, 10);

  if (pool) {
    try {
      const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [taskId]);
      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Task not found' });
      }
      return res.json({ success: true, data: rows[0] });
    } catch (err) {
      console.error('MySQL select error:', err.message);
    }
  }

  const task = inMemoryTasks.find(t => t.id === taskId);
  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }
  res.json({ success: true, data: task });
});

// POST /api/tasks (create task)
router.post('/', async (req, res) => {
  const { title, description, status = 'pending', priority = 'medium', due_date } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({ success: false, message: 'Title is required' });
  }

  const pool = getPool(req);
  const validStatus = ['pending', 'in-progress', 'completed'].includes(status) ? status : 'pending';
  const validPriority = ['low', 'medium', 'high', 'urgent'].includes(priority) ? priority : 'medium';
  const formattedDueDate = due_date || null;

  if (pool) {
    try {
      const query = 'INSERT INTO tasks (title, description, status, priority, due_date) VALUES (?, ?, ?, ?, ?)';
      const [result] = await pool.query(query, [
        title.trim(),
        description ? description.trim() : null,
        validStatus,
        validPriority,
        formattedDueDate
      ]);

      const [newRows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [result.insertId]);
      return res.status(201).json({ success: true, data: newRows[0], message: 'Task created in MySQL' });
    } catch (err) {
      console.error('MySQL insert error, using memory fallback:', err.message);
    }
  }

  const newTask = {
    id: nextId++,
    title: title.trim(),
    description: description ? description.trim() : '',
    status: validStatus,
    priority: validPriority,
    due_date: formattedDueDate,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  inMemoryTasks.unshift(newTask);
  res.status(201).json({ success: true, data: newTask, message: 'Task created in memory' });
});

// PUT /api/tasks/:id (update task)
router.put('/:id', async (req, res) => {
  const taskId = parseInt(req.params.id, 10);
  const { title, description, status, priority, due_date } = req.body;
  const pool = getPool(req);

  if (pool) {
    try {
      const [existing] = await pool.query('SELECT * FROM tasks WHERE id = ?', [taskId]);
      if (existing.length === 0) {
        return res.status(404).json({ success: false, message: 'Task not found' });
      }

      const current = existing[0];
      const updatedTitle = title !== undefined ? title.trim() : current.title;
      const updatedDesc = description !== undefined ? description.trim() : current.description;
      const updatedStatus = status !== undefined ? status : current.status;
      const updatedPriority = priority !== undefined ? priority : current.priority;
      const updatedDueDate = due_date !== undefined ? due_date : current.due_date;

      const query = `
        UPDATE tasks 
        SET title = ?, description = ?, status = ?, priority = ?, due_date = ? 
        WHERE id = ?
      `;
      await pool.query(query, [updatedTitle, updatedDesc, updatedStatus, updatedPriority, updatedDueDate, taskId]);

      const [updatedRows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [taskId]);
      return res.json({ success: true, data: updatedRows[0], message: 'Task updated successfully' });
    } catch (err) {
      console.error('MySQL update error:', err.message);
    }
  }

  const index = inMemoryTasks.findIndex(t => t.id === taskId);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  inMemoryTasks[index] = {
    ...inMemoryTasks[index],
    title: title !== undefined ? title.trim() : inMemoryTasks[index].title,
    description: description !== undefined ? description.trim() : inMemoryTasks[index].description,
    status: status !== undefined ? status : inMemoryTasks[index].status,
    priority: priority !== undefined ? priority : inMemoryTasks[index].priority,
    due_date: due_date !== undefined ? due_date : inMemoryTasks[index].due_date,
    updated_at: new Date().toISOString()
  };

  res.json({ success: true, data: inMemoryTasks[index], message: 'Task updated successfully' });
});

// DELETE /api/tasks/:id (delete task)
router.delete('/:id', async (req, res) => {
  const taskId = parseInt(req.params.id, 10);
  const pool = getPool(req);

  if (pool) {
    try {
      const [existing] = await pool.query('SELECT * FROM tasks WHERE id = ?', [taskId]);
      if (existing.length === 0) {
        return res.status(404).json({ success: false, message: 'Task not found' });
      }
      await pool.query('DELETE FROM tasks WHERE id = ?', [taskId]);
      return res.json({ success: true, message: 'Task deleted successfully', data: existing[0] });
    } catch (err) {
      console.error('MySQL delete error:', err.message);
    }
  }

  const index = inMemoryTasks.findIndex(t => t.id === taskId);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  const deleted = inMemoryTasks.splice(index, 1)[0];
  res.json({ success: true, message: 'Task deleted successfully', data: deleted });
});

module.exports = router;
