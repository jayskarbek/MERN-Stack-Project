const { setupTestDB, teardownTestDB, clearDatabase } = require('./setup');
const { ObjectId } = require('mongodb');

let db;
let reviewsCollection;

async function calculateParkRatings(reviewsCollection, parkId) {
    const reviews = await reviewsCollection.find({ parkId: parkId.toString() }).toArray();
    
    if (reviews.length === 0) {
        return {
            averageRating: 0,
            reviewCount: 0,
            ratingBreakdown: {
                views: 0,
                location: 0,
                amenities: 0
            }
        };
    }

    const totals = reviews.reduce((acc, review) => {
        acc.views += review.ratings.views || 0;
        acc.location += review.ratings.location || 0;
        acc.amenities += review.ratings.amenities || 0;
        return acc;
    }, { views: 0, location: 0, amenities: 0 });

    const count = reviews.length;
    
    const avgViews = totals.views / count;
    const avgLocation = totals.location / count;
    const avgAmenities = totals.amenities / count;
    
    const overallAverage = (avgViews + avgLocation + avgAmenities) / 3;

    return {
        averageRating: Math.round(overallAverage * 10) / 10,
        reviewCount: count,
        ratingBreakdown: {
            views: Math.round(avgViews * 10) / 10,
            location: Math.round(avgLocation * 10) / 10,
            amenities: Math.round(avgAmenities * 10) / 10
        }
    };
}

beforeAll(async () => {
    const testDB = await setupTestDB();
    db = testDB.db;
    reviewsCollection = db.collection('Reviews');
});

afterAll(async () => {
    await teardownTestDB();
});

afterEach(async () => {
    await clearDatabase();
});

describe('Rating Calculation Utilities', () => {
    test('should return zero ratings for park with no reviews', async () => {
        const parkId = new ObjectId();
        const ratings = await calculateParkRatings(reviewsCollection, parkId);

        expect(ratings.averageRating).toBe(0);
        expect(ratings.reviewCount).toBe(0);
        expect(ratings.ratingBreakdown).toEqual({
            views: 0,
            location: 0,
            amenities: 0
        });
    });

    test('should calculate correct average for single review', async () => {
        const parkId = new ObjectId();
        await reviewsCollection.insertOne({
            parkId: parkId.toString(),
            userId: 'user-1',
            ratings: { views: 5, location: 4, amenities: 3 }
        });

        const ratings = await calculateParkRatings(reviewsCollection, parkId);

        expect(ratings.averageRating).toBe(4.0); // (5+4+3)/3 = 4.0
        expect(ratings.reviewCount).toBe(1);
        expect(ratings.ratingBreakdown.views).toBe(5);
        expect(ratings.ratingBreakdown.location).toBe(4);
        expect(ratings.ratingBreakdown.amenities).toBe(3);
    });

    test('should calculate correct average for multiple reviews', async () => {
        const parkId = new ObjectId();
        await reviewsCollection.insertMany([
            {
                parkId: parkId.toString(),
                userId: 'user-1',
                ratings: { views: 5, location: 5, amenities: 5 }
            },
            {
                parkId: parkId.toString(),
                userId: 'user-2',
                ratings: { views: 3, location: 4, amenities: 3 }
            }
        ]);

        const ratings = await calculateParkRatings(reviewsCollection, parkId);

        expect(ratings.averageRating).toBe(4.2);
        expect(ratings.reviewCount).toBe(2);
        expect(ratings.ratingBreakdown.views).toBe(4);
        expect(ratings.ratingBreakdown.location).toBe(4.5);
        expect(ratings.ratingBreakdown.amenities).toBe(4);
    });

    test('should round ratings to one decimal place', async () => {
        const parkId = new ObjectId();
        await reviewsCollection.insertMany([
            {
                parkId: parkId.toString(),
                userId: 'user-1',
                ratings: { views: 5, location: 4, amenities: 4 }
            },
            {
                parkId: parkId.toString(),
                userId: 'user-2',
                ratings: { views: 4, location: 5, amenities: 3 }
            },
            {
                parkId: parkId.toString(),
                userId: 'user-3',
                ratings: { views: 3, location: 3, amenities: 5 }
            }
        ]);

        const ratings = await calculateParkRatings(reviewsCollection, parkId);

        // Check that ratings are numbers with at most 1 decimal place
        expect(ratings.averageRating).toBeCloseTo(4.0, 1);
        expect(ratings.ratingBreakdown.views).toBeCloseTo(4.0, 1);
        expect(ratings.ratingBreakdown.location).toBeCloseTo(4.0, 1);
        expect(ratings.ratingBreakdown.amenities).toBeCloseTo(4.0, 1);
        
        // Verify they are properly rounded 
        expect(Number.isInteger(ratings.averageRating * 10)).toBe(true);
        expect(Number.isInteger(ratings.ratingBreakdown.views * 10)).toBe(true);
        expect(Number.isInteger(ratings.ratingBreakdown.location * 10)).toBe(true);
        expect(Number.isInteger(ratings.ratingBreakdown.amenities * 10)).toBe(true);
    });

    test('should handle reviews with missing rating fields', async () => {
        const parkId = new ObjectId();
        await reviewsCollection.insertOne({
            parkId: parkId.toString(),
            userId: 'user-1',
            ratings: { views: 5 } // Missing location and amenities
        });

        const ratings = await calculateParkRatings(reviewsCollection, parkId);

        expect(ratings.averageRating).toBe(1.7); // (5+0+0)/3 ≈ 1.7
        expect(ratings.reviewCount).toBe(1);
    });
});