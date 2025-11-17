import React, { useState } from 'react';
import ProfileReviewCard from './ProfileReviewCard';

interface Park {
    _id: string;
    name: string;
    counties: string[];
    image_url: string;
}

interface Review {
    _id: string;
    parkId: string;
    comment: string;
    ratings: {
        views: number;
        location: number;
        amenities: number;
    };
    createdAt: string;
    park: Park | null;
}

interface ProfileReviewsSectionProps {
    recentReviews: Review[];
    allReviews: Review[];
}

const ProfileReviewsSection: React.FC<ProfileReviewsSectionProps> = ({
    recentReviews,
    allReviews
}) => {
    const [showAllReviews, setShowAllReviews] = useState(false);
    const reviewsToShow = showAllReviews ? allReviews : recentReviews;

    return (
        <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
            }}>
                <h2 style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#2c3e50',
                    margin: 0
                }}>
                    {showAllReviews ? `All Reviews (${allReviews.length})` : 'Recent Reviews'}
                </h2>
                {allReviews.length > 5 && (
                    <button
                        onClick={() => setShowAllReviews(!showAllReviews)}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#27ae60',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500'
                        }}
                    >
                        {showAllReviews ? 'Show Recent' : 'Show All'}
                    </button>
                )}
            </div>

            {reviewsToShow.length === 0 ? (
                <div style={{
                    padding: '40px',
                    textAlign: 'center',
                    color: '#6c757d'
                }}>
                    <p style={{ fontSize: '18px', margin: 0 }}>
                        You haven't written any reviews yet.
                    </p>
                </div>
            ) : (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                }}>
                    {reviewsToShow.map((review) => (
                        <ProfileReviewCard key={review._id} review={review} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProfileReviewsSection;
