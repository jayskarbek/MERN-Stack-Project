const jwt = require('jsonwebtoken');
const authenticateToken = require('../middleware/auth');

// Mock Express request and response objects
const mockRequest = (headers = {}) => ({
    headers
});

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

const mockNext = jest.fn();

beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret-key';
});

beforeEach(() => {
    jest.clearAllMocks();
});

describe('Authentication Middleware', () => {
    test('should authenticate with valid token', () => {
        const token = jwt.sign(
            { userId: 'test-123', email: 'test@example.com' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        const req = mockRequest({
            authorization: `Bearer ${token}`
        });
        const res = mockResponse();
        const next = mockNext;

        authenticateToken(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(req.user).toHaveProperty('userId', 'test-123');
        expect(req.user).toHaveProperty('email', 'test@example.com');
    });

    test('should reject request without token', () => {
        const req = mockRequest();
        const res = mockResponse();
        const next = mockNext;

        authenticateToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Access token required' });
        expect(next).not.toHaveBeenCalled();
    });

    test('should reject request with invalid token', () => {
        const req = mockRequest({
            authorization: 'Bearer invalid-token'
        });
        const res = mockResponse();
        const next = mockNext;

        authenticateToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
        expect(next).not.toHaveBeenCalled();
    });

    test('should reject request with expired token', () => {
        const expiredToken = jwt.sign(
            { userId: 'test-123', email: 'test@example.com' },
            process.env.JWT_SECRET,
            { expiresIn: '-1h' } // Expired 1 hour ago
        );

        const req = mockRequest({
            authorization: `Bearer ${expiredToken}`
        });
        const res = mockResponse();
        const next = mockNext;

        authenticateToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
        expect(next).not.toHaveBeenCalled();
    });

    test('should reject malformed authorization header', () => {
        const req = mockRequest({
            authorization: 'NotBearer token-here'
        });
        const res = mockResponse();
        const next = mockNext;

        authenticateToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
    });
});