import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getDisplayUrl } from '../utils/wikipediaImageHelper';

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

interface ProfileReviewCardProps {
    review: Review;
}

const ProfileReviewCard: React.FC<ProfileReviewCardProps> = ({ review }) => {
    const navigate = useNavigate();

    return (
        <div
            style={{
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                padding: '20px',
                cursor: review.park ? 'pointer' : 'default',
                transition: 'box-shadow 0.2s'
            }}
            onClick={() => review.park && navigate(`/parks/${review.parkId}`)}
            onMouseOver={(e) => {
                if (review.park) {
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                }
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            <div style={{
                display: 'flex',
                gap: '16px',
                marginBottom: '12px'
            }}>
                {review.park && (
                    <img
                        src={getDisplayUrl(review.park.image_url)}
                        alt={review.park.name}
                        style={{
                            width: '80px',
                            height: '80px',
                            objectFit: 'cover',
                            borderRadius: '6px',
                            flexShrink: 0
                        }}
                    />
                )}
                <div style={{ flex: 1 }}>
                    <h3 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#2c3e50',
                        margin: '0 0 4px 0'
                    }}>
                        {review.park ? review.park.name : 'Park Not Found'}
                    </h3>
                    <p style={{
                        fontSize: '14px',
                        color: '#6c757d',
                        margin: '0 0 8px 0'
                    }}>
                        {new Date(review.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>
                    <div style={{
                        display: 'flex',
                        gap: '16px',
                        fontSize: '14px'
                    }}>
                        <span>Views: {review.ratings.views} <span style={{ color: '#f4c542' }}>★</span></span>
                        <span>Location: {review.ratings.location} <span style={{ color: '#f4c542' }}>★</span></span>
                        <span>Amenities: {review.ratings.amenities} <span style={{ color: '#f4c542' }}>★</span></span>
                    </div>
                </div>
            </div>
            <p style={{
                fontSize: '15px',
                color: '#555',
                lineHeight: '1.6',
                margin: 0
            }}>
                {review.comment}
            </p>
        </div>
    );
};

export default ProfileReviewCard;
