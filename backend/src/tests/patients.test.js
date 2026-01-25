const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Mock User model
jest.mock('../models/User');

describe('Patients API', () => {
    let mockAdmin;
    let mockToken;

    beforeEach(() => {
        jest.clearAllMocks();

        mockAdmin = {
            _id: 'admin_id_123',
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@test.com',
            role: 'admin',
        };

        mockToken = jwt.sign({ id: mockAdmin._id }, process.env.JWT_SECRET || 'test_secret');
    });

    describe('GET /api/patients', () => {
        it('should return all patients for admin', async () => {
            User.findById.mockResolvedValue(mockAdmin);
            User.find.mockResolvedValue([
                { _id: 'p1', firstName: 'John', lastName: 'Doe', role: 'patient' }
            ]);

            const res = await request(app)
                .get('/api/patients')
                .set('Authorization', `Bearer ${mockToken}`);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body[0].firstName).toBe('John');
        });

        it('should handle database errors with a 500', async () => {
            User.findById.mockResolvedValue(mockAdmin);
            User.find.mockImplementation(() => {
                throw new Error('Database connection failed');
            });

            const res = await request(app)
                .get('/api/patients')
                .set('Authorization', `Bearer ${mockToken}`);

            expect(res.status).toBe(500);
            expect(res.body.message).toBe('Database connection failed');
        });
    });
});
