const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');

// Controllers
const { logSession, getHistory, getStats } = require('../controllers/sessionController');
const { getTasks, createTask, updateTask, deleteTask } = require('../controllers/taskController');
const { getGoals, createGoal, deleteGoal } = require('../controllers/goalController');
const { getLeaderboard } = require('../controllers/socialController');
const { getDashboardStats, getUsers, deleteUser } = require('../controllers/adminController');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication management
 *   name: Sessions
 *   description: Work session tracking
 *   name: Tasks
 *   description: Task management
 *   name: Social
 *   description: Leaderboards and social features
 */

// --- Session Routes ---
/**
 * @swagger
 * /sessions:
 *   post:
 *     summary: Log a work session
 *     tags: [Sessions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               duration:
 *                 type: number
 *               dateKey:
 *                 type: string
 *     responses:
 *       201:
 *         description: Session created
 *   get:
 *     summary: Get session history
 *     tags: [Sessions]
 *     responses:
 *       200:
 *         description: List of sessions
 */
router.post('/sessions', protect, logSession);
router.get('/sessions', protect, getHistory);
router.get('/sessions/stats', protect, getStats);

// --- Task Routes ---
/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Get all tasks
 *     tags: [Tasks]
 *     responses:
 *       200:
 *         description: List of tasks
 *   post:
 *     summary: Create a task
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Task created
 */
router.get('/tasks', protect, getTasks);
router.post('/tasks', protect, createTask);
router.patch('/tasks/:id', protect, updateTask);
router.delete('/tasks/:id', protect, deleteTask);

// --- Goal Routes ---
router.get('/goals', protect, getGoals);
router.post('/goals', protect, createGoal);
router.delete('/goals/:id', protect, deleteGoal);

// --- Social Routes ---
/**
 * @swagger
 * /social/leaderboard:
 *   get:
 *     summary: Get leaderboard
 *     tags: [Social]
 *     responses:
 *       200:
 *         description: Leaderboard data
 */
router.get('/social/leaderboard', protect, getLeaderboard);

// --- Admin Routes ---
router.get('/admin/dashboard', protect, admin, getDashboardStats);
router.get('/admin/users', protect, admin, getUsers);
router.delete('/admin/users/:id', protect, admin, deleteUser);

module.exports = router;
