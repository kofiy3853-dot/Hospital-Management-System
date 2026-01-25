const request = require('supertest');
require('dotenv').config();
const app = require('../app');
const { User } = require('../models');

// Mock all models
jest.mock('../models', () => {
    const mockUser = {
        findOne: jest.fn(),
        create: jest.fn(),
    };
    
    return {
        User: mockUser,
        Department: { hasMany: jest.fn(), belongsTo: jest.fn() },
        Appointment: { hasMany: jest.fn(), belongsTo: jest.fn() },
        MedicalRecord: { hasMany: jest.fn(), belongsTo: jest.fn() },
        Prescription: { hasMany: jest.fn(), belongsTo: jest.fn() },
        Inventory: { hasMany: jest.fn(), belongsTo: jest.fn() },
        LabTest: { hasMany: jest.fn(), belongsTo: jest.fn() },
        Billing: { hasMany: jest.fn(), belongsTo: jest.fn() },
        AuditLog: { hasMany: jest.fn(), belongsTo: jest.fn() },
        Ward: { hasMany: jest.fn(), belongsTo: jest.fn() },
        Bed: { hasMany: jest.fn(), belongsTo: jest.fn() },
        Admission: { hasMany: jest.fn(), belongsTo: jest.fn() },
        Notification: { hasMany: jest.fn(), belongsTo: jest.fn() },
        sequelize: {
            authenticate: jest.fn(),
            sync: jest.fn(),
            query: jest.fn()
        }
    };
});

describe('Authentication API', () => {
    let newUser;

    beforeEach(() => {
        jest.clearAllMocks();

        newUser = {
            id: 'mock_id_123',
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
            role: 'patient',
            matchPassword: jest.fn().mockResolvedValue(true),
        };
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', async () => {
            User.findOne.mockResolvedValue(null);
            User.create.mockResolvedValue(newUser);

            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    firstName: 'Test',
                    lastName: 'User',
                    email: 'test@example.com',
                    password: 'password123',
                    role: 'patient'
                });

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('id');
            expect(res.body.email).toBe('test@example.com');
        });

        it('should return 400 if user already exists', async () => {
            User.findOne.mockResolvedValue(newUser);

            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'test@example.com',
                    password: 'password123'
                });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('User already exists');
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login user and return token', async () => {
            User.findOne.mockResolvedValue(newUser);

            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123'
                });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('token');
            expect(res.body.email).toBe('test@example.com');
        });

        it('should return 401 for invalid credentials', async () => {
            User.findOne.mockResolvedValue(null);

            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'wrong@example.com',
                    password: 'wrongpassword'
                });

            expect(res.status).toBe(401);
            expect(res.body.message).toBe('Invalid email or password');
        });
    });
});
