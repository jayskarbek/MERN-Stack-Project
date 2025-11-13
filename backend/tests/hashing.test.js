const bcrypt = require('bcrypt');

describe('Password Hashing - Unit Tests', () => {
    describe('bcrypt.hash', () => {
        test('should hash password successfully', async () => {
            const password = 'Password123!';
            const hash = await bcrypt.hash(password, 10);
            
            expect(hash).toBeDefined();
            expect(hash).not.toBe(password);
            expect(hash.length).toBeGreaterThan(0);
        });

        test('should create different hashes for same password', async () => {
            const password = 'Password123!';
            const hash1 = await bcrypt.hash(password, 10);
            const hash2 = await bcrypt.hash(password, 10);
            
            expect(hash1).not.toBe(hash2); 
        });
    });

    describe('bcrypt.compare', () => {
        test('should verify correct password', async () => {
            const password = 'Password123!';
            const hash = await bcrypt.hash(password, 10);
            
            const isMatch = await bcrypt.compare(password, hash);
            expect(isMatch).toBe(true);
        });

        test('should reject incorrect password', async () => {
            const password = 'Password123!';
            const wrongPassword = 'WrongPassword!';
            const hash = await bcrypt.hash(password, 10);
            
            const isMatch = await bcrypt.compare(wrongPassword, hash);
            expect(isMatch).toBe(false);
        });

        test('should be case sensitive', async () => {
            const password = 'Password123!';
            const hash = await bcrypt.hash(password, 10);
            
            const isMatch = await bcrypt.compare('password123!', hash);
            expect(isMatch).toBe(false);
        });
    });
});