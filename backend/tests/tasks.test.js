const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const Task = require('../models/Task');

let token;
let taskId;
let userId;

beforeAll(async () => {
  const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/tms-test-db';
  await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

  // Clean up
  await User.deleteMany({});
  await Task.deleteMany({});

  // Register a test user and get token
  const res = await request(app)
    .post('/api/auth/register')
    .send({ email: 'tasktest@example.com', password: 'password123' });

  token = res.body.token;
  userId = res.body._id;
});

afterAll(async () => {
  await User.deleteMany({});
  await Task.deleteMany({});
  await mongoose.connection.close();
});

describe('Task API Endpoints', () => {
  it('should create a new task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Task',
        description: 'A test task description',
        status: 'Todo',
        priority: 'High',
        dueDate: '2026-04-20',
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('title', 'Test Task');
    expect(res.body).toHaveProperty('priority', 'High');
    taskId = res.body._id;
  });

  it('should get all tasks for the user', async () => {
    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('tasks');
    expect(res.body.tasks.length).toBeGreaterThan(0);
    expect(res.body).toHaveProperty('page');
    expect(res.body).toHaveProperty('pages');
  });

  it('should get tasks with status filter', async () => {
    const res = await request(app)
      .get('/api/tasks?status=Todo')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.tasks.every(t => t.status === 'Todo')).toBe(true);
  });

  it('should get tasks with priority filter', async () => {
    const res = await request(app)
      .get('/api/tasks?priority=High')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.tasks.every(t => t.priority === 'High')).toBe(true);
  });

  it('should get a task by ID', async () => {
    const res = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('title', 'Test Task');
  });

  it('should return 404 for non-existent task', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .get(`/api/tasks/${fakeId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(404);
  });

  it('should update a task', async () => {
    const res = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Updated Task Title',
        status: 'In Progress',
        priority: 'Medium',
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('title', 'Updated Task Title');
    expect(res.body).toHaveProperty('status', 'In Progress');
    expect(res.body).toHaveProperty('priority', 'Medium');
  });

  it('should return 404 when updating non-existent task', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/api/tasks/${fakeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Ghost Task' });

    expect(res.statusCode).toEqual(404);
  });

  it('should delete a task', async () => {
    const res = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Task removed');
  });

  it('should return 404 when deleting non-existent task', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .delete(`/api/tasks/${fakeId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(404);
  });

  it('should reject requests without auth token', async () => {
    const res = await request(app)
      .get('/api/tasks');

    expect(res.statusCode).toEqual(401);
  });
});
