import React, { useState } from 'react';
import axios from 'axios';
import { auth } from '../utils/auth';
import { buildApiUrl } from '../utils/api';
import type { Review } from '../types/Review';

interface RatingSet {
    views: number;
    location: number;
    amenities: number;
    overall: number;
}

interface ReviewsListProps {
    reviews: Review[];
    onReviewUpdated: () => void;
    parkId: string;
}

const ReviewsList: React.FC<ReviewsListProps> = ({ reviews, onReviewUpdated, parkId }) => {
    const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
    const [editComment, setEditComment] = useState<string>('');
    const [editRatings, setEditRatings] = useState<RatingSet>({
        views: 0,
        location: 0,
        amenities: 0,
        overall: 0
    });
    const currentUserId = auth.getUserId();

    const handleEditClick = (review: Review) => {
        setEditingReviewId(review._id);
        setEditComment(review.comment);
        setEditRatings(review.ratings);
    };

    const handleCancelEdit = () => {
        setEditingReviewId(null);
        setEditComment('');
    };

    const handleSaveEdit = async (reviewId: string) => {
        try {
            const token = auth.getToken();
            if (!token) {
                alert('Please log in to edit reviews');
                return;
            }

            await axios.patch(
                buildApiUrl(`parks/${parkId}/reviews/${reviewId}`),
                {
                    comment: editComment,
                    ratings: editRatings
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            setEditingReviewId(null);
            onReviewUpdated();
        } catch (error) {
            console.error('Error updating review:', error);
            alert('Failed to update review. Please try again.');
        }
    };

    const handleDelete = async (reviewId: string) => {
        if (!window.confirm('Are you sure you want to delete this review?')) {
            return;
        }

        try {
            const token = auth.getToken();
            if (!token) {
                alert('Please log in to delete reviews');
                return;
            }

            await axios.delete(
                buildApiUrl(`parks/${parkId}/reviews/${reviewId}`),
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            onReviewUpdated();
        } catch (error) {
            console.error('Error deleting review:', error);
            alert('Failed to delete review. Please try again.');
        }
    };

    const handleRatingChange = (category: keyof RatingSet, value: number) => {
        setEditRatings(prev => ({ ...prev, [category]: value }));
    };

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
                    {reviews.map((review) => {
                        const isEditing = editingReviewId === review._id;
                        const isOwner = currentUserId === review.userId;

                        return (
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
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                                        {isOwner && !isEditing && (
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={() => handleEditClick(review)}
                                                    style={{
                                                        padding: '4px 12px',
                                                        backgroundColor: '#3498db',
                                                        color: '#fff',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        fontSize: '14px'
                                                    }}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(review._id)}
                                                    style={{
                                                        padding: '4px 12px',
                                                        backgroundColor: '#e74c3c',
                                                        color: '#fff',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        fontSize: '14px'
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {isEditing ? (
                                    <>
                                        <textarea
                                            value={editComment}
                                            onChange={(e) => setEditComment(e.target.value)}
                                            style={{
                                                width: '100%',
                                                minHeight: '80px',
                                                padding: '10px',
                                                borderRadius: '4px',
                                                border: '1px solid #ddd',
                                                fontSize: '15px',
                                                marginBottom: '16px',
                                                fontFamily: 'inherit',
                                                resize: 'vertical'
                                            }}
                                        />

                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                            gap: '16px',
                                            marginBottom: '16px'
                                        }}>
                                            {(['views', 'location', 'amenities'] as const).map((category) => (
                                                <div key={category}>
                                                    <label style={{ 
                                                        display: 'block',
                                                        marginBottom: '8px',
                                                        fontWeight: '500',
                                                        textTransform: 'capitalize',
                                                        color: '#2c3e50'
                                                    }}>
                                                        {category}
                                                    </label>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        {[1, 2, 3, 4, 5].map((value) => (
                                                            <button
                                                                key={value}
                                                                type="button"
                                                                onClick={() => handleRatingChange(category, value)}
                                                                style={{
                                                                    padding: '8px 12px',
                                                                    border: '2px solid',
                                                                    borderColor: editRatings[category] >= value ? '#f1c40f' : '#ddd',
                                                                    backgroundColor: editRatings[category] >= value ? '#fff9e6' : '#fff',
                                                                    borderRadius: '4px',
                                                                    cursor: 'pointer',
                                                                    fontSize: '16px',
                                                                    transition: 'all 0.2s'
                                                                }}
                                                            >
                                                                {value}★
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                            <button
                                                onClick={handleCancelEdit}
                                                style={{
                                                    padding: '8px 16px',
                                                    backgroundColor: '#95a5a6',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '14px'
                                                }}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => handleSaveEdit(review._id)}
                                                style={{
                                                    padding: '8px 16px',
                                                    backgroundColor: '#27ae60',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '14px'
                                                }}
                                            >
                                                Save Changes
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
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
                                                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                                                    <span style={{ color: '#2c3e50' }}>{review.ratings.views}</span>
                                                    <span style={{ color: '#f1c40f' }}>★</span>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '4px' }}>Location</div>
                                                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                                                    <span style={{ color: '#2c3e50' }}>{review.ratings.location}</span>
                                                    <span style={{ color: '#f1c40f' }}>★</span>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '4px' }}>Amenities</div>
                                                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                                                    <span style={{ color: '#2c3e50' }}>{review.ratings.amenities}</span>
                                                    <span style={{ color: '#f1c40f' }}>★</span>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ReviewsList;