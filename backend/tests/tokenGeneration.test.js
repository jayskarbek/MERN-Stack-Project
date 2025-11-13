const jwt = require('jsonwebtoken');

describe('JWT Token Generation - Unit Tests', () => {
    const testSecret = 'test-secret-key';
    
    beforeAll(() => {
        process.env.JWT_SECRET = testSecret;
    });

    describe('jwt.sign', () => {
        test('should create valid token with user data', () => {
            const payload = {
                userId: 'test-123',
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe'
            };

            const token = jwt.sign(payload, testSecret, { expiresIn: '7d' });
            
            expect(token).toBeDefined();
            expect(typeof token).toBe('string');
            expect(token.split('.')).toHaveLength(3); 
        });

        test('should include expiration time', () => {
            const payload = { userId: 'test-123' };
            const token = jwt.sign(payload, testSecret, { expiresIn: '1h' });
            
            const decoded = jwt.decode(token);
            expect(decoded.exp).toBeDefined();
        });
    });

    describe('jwt.verify', () => {
        test('should verify valid token', () => {
            const payload = { userId: 'test-123', email: 'test@example.com' };
            const token = jwt.sign(payload, testSecret);
            
            const decoded = jwt.verify(token, testSecret);
            
            expect(decoded.userId).toBe('test-123');
            expect(decoded.email).toBe('test@example.com');
        });

        test('should reject invalid signature', () => {
            const payload = { userId: 'test-123' };
            const token = jwt.sign(payload, testSecret);
            
            expect(() => {
                jwt.verify(token, 'wrong-secret');
            }).toThrow();
        });

        test('should reject expired token', () => {
            const payload = { userId: 'test-123' };
            const token = jwt.sign(payload, testSecret, { expiresIn: '0s' });
            
            // Wait a tiny bit for expiration
            return new Promise(resolve => setTimeout(resolve, 10))
                .then(() => {
                    expect(() => {
                        jwt.verify(token, testSecret);
                    }).toThrow();
                });
        });

        test('should reject malformed token', () => {
            expect(() => {
                jwt.verify('not.a.token', testSecret);
            }).toThrow();
        });
    });

    describe('jwt.decode', () => {
        test('should decode token without verification', () => {
            const payload = { userId: 'test-123', role: 'user' };
            const token = jwt.sign(payload, testSecret);
            
            const decoded = jwt.decode(token);
            
            expect(decoded.userId).toBe('test-123');
            expect(decoded.role).toBe('user');
        });

        test('should return null for invalid token', () => {
            const decoded = jwt.decode('invalid-token');
            expect(decoded).toBeNull();
        });
    });
});