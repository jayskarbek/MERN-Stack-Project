import React from 'react';

interface RatingSet {
    views: number;
    location: number;
    amenities: number;
    overall: number;
}

interface Review {
    _id: string;
    ratings: RatingSet;
    comment: string;
    userId: string;
    userName?: string; // Added userName field from backend
    createdAt: string;
}

interface ReviewsListProps {
    reviews: Review[];
}

const ReviewsList: React.FC<ReviewsListProps> = ({ reviews }) => {
    return (
        <div style={{ marginTop: '40px' }}>
            <h2 style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                marginBottom: '20px',
                color: '#333'
            }}>
                Reviews ({reviews.length})
            </h2>
            
            {reviews.length === 0 ? (
                <div style={{
                    padding: '40px',
                    textAlign: 'center',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    color: '#6c757d'
                }}>
                    <p>No reviews yet. Be the first to review this park!</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {reviews.map((review) => (
                        <div 
                            key={review._id} 
                            style={{ 
                                padding: '20px',
                                backgroundColor: '#fff',
                                borderRadius: '8px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                border: '1px solid #e0e0e0'
                            }}
                        >
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                marginBottom: '12px'
                            }}>
                                <p style={{ 
                                    fontWeight: '600', 
                                    color: '#2c3e50',
                                    margin: 0
                                }}>
                                    {review.userName || 'Anonymous User'}
                                </p>
                                <p style={{ 
                                    fontSize: '14px', 
                                    color: '#7f8c8d',
                                    margin: 0
                                }}>
                                    {new Date(review.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>

                            <p style={{ 
                                color: '#555',
                                lineHeight: '1.6',
                                marginBottom: '16px',
                                fontSize: '15px'
                            }}>
                                {review.comment}
                            </p>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                                gap: '12px',
                                padding: '16px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '6px'
                            }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '4px' }}>Views</div>
                                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f1c40f' }}>
                                        {review.ratings.views}★
                                    </div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '4px' }}>Location</div>
                                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f1c40f' }}>
                                        {review.ratings.location}★
                                    </div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '4px' }}>Amenities</div>
                                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f1c40f' }}>
                                        {review.ratings.amenities}★
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReviewsList;
