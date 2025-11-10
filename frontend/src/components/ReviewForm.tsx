import React, { useState } from 'react';
import axios from 'axios';
import { auth } from '../utils/auth';

interface ReviewFormProps {
    parkId: string;
    onReviewSubmitted: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ parkId, onReviewSubmitted }) => {
    const [comment, setComment] = useState('');
    const [ratings, setRatings] = useState({
        views: 0,
        location: 0,
        amenities: 0
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    const handleRatingClick = (category: 'views' | 'location' | 'amenities', value: number) => {
        if (category === 'views') {
            setRatings({
                views: value,
                location: ratings.location,
                amenities: ratings.amenities
            });
        } else if (category === 'location') {
            setRatings({
                views: ratings.views,
                location: value,
                amenities: ratings.amenities
            });
        } else if (category === 'amenities') {
            setRatings({
                views: ratings.views,
                location: ratings.location,
                amenities: value
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Check if user is authenticated
        if (!auth.isAuthenticated()) {
            setError('Please log in to submit a review.');
            return;
        }

        if (!comment.trim()) {
            setError('Please add a comment to your review.');
            return;
        }

        if (ratings.views === 0 || ratings.location === 0 || ratings.amenities === 0) {
            setError('Please provide all ratings.');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            const token = auth.getToken();
            
            await axios.post(
                `API_URL + '/parks/${parkId}/reviews`,
                {
                    comment: comment.trim(),
                    ratings: {
                        views: ratings.views,
                        location: ratings.location,
                        amenities: ratings.amenities
                    }
                    // Note: userId is now taken from JWT token on backend, no need to send it
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            setComment('');
            setRatings({
                views: 0,
                location: 0,
                amenities: 0
            });
            
            onReviewSubmitted();
        } catch (err: any) {
            console.error('Error submitting review:', err);
            if (err.response?.status === 401) {
                setError('Your session has expired. Please log in again.');
                // Optionally redirect to login
                // auth.logout();
                // window.location.href = '/';
            } else {
                setError(err.response?.data?.error || 'Failed to submit review. Please try again.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const StarRating = ({ 
        label, 
        category, 
        value
    }: { 
        label: string; 
        category: 'views' | 'location' | 'amenities'; 
        value: number;
    }) => {
        return (
            <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{
                    display: 'block',
                    fontSize: '15px',
                    fontWeight: '600',
                    color: '#2c3e50',
                    marginBottom: '10px'
                }}>
                    {label}
                </label>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => handleRatingClick(category, star)}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '32px',
                                padding: '4px',
                                transition: 'transform 0.1s',
                                lineHeight: 1,
                                color: star <= value ? '#f39c12' : '#d1d5db'
                            }}
                        >
                            {star <= value ? '★' : '☆'}
                        </button>
                    ))}
                    <span style={{
                        marginLeft: '12px',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: value > 0 ? '#27ae60' : '#95a5a6',
                        minWidth: '50px'
                    }}>
                        {value > 0 ? `${value}/5` : '-'}
                    </span>
                </div>
            </div>
        );
    };

    return (
        <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            padding: '30px',
            marginBottom: '30px',
            border: '2px solid transparent',
            transition: 'border-color 0.3s'
        }}>
            <h2 style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#2c3e50',
                marginTop: 0,
                marginBottom: '8px'
            }}>
                Write a Review
            </h2>
            <p style={{
                color: '#6c757d',
                fontSize: '14px',
                marginTop: 0,
                marginBottom: '28px'
            }}>
                Share your experience and help others discover this park
            </p>

            <form onSubmit={handleSubmit}>
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '24px',
                    marginBottom: '28px',
                    padding: '24px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '10px',
                    border: '1px solid #e9ecef'
                }}>
                    <StarRating 
                        label="Views" 
                        category="views" 
                        value={ratings.views}
                    />
                    <StarRating 
                        label="Location" 
                        category="location" 
                        value={ratings.location}
                    />
                    <StarRating 
                        label="Amenities" 
                        category="amenities" 
                        value={ratings.amenities}
                    />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{
                        display: 'block',
                        fontSize: '15px',
                        fontWeight: '600',
                        color: '#2c3e50',
                        marginBottom: '10px'
                    }}>
                        Your Review
                    </label>
                    <div style={{
                        position: 'relative',
                        borderRadius: '10px',
                        border: `2px solid ${isFocused ? '#27ae60' : '#e0e0e0'}`,
                        transition: 'border-color 0.3s, box-shadow 0.3s',
                        boxShadow: isFocused ? '0 0 0 3px rgba(39, 174, 96, 0.1)' : 'none',
                        backgroundColor: '#fff'
                    }}>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            placeholder="Share your experience at this park... What did you love? What could be improved?"
                            rows={6}
                            style={{
                                width: '100%',
                                padding: '16px',
                                fontSize: '15px',
                                borderRadius: '10px',
                                border: 'none',
                                resize: 'vertical',
                                fontFamily: 'inherit',
                                boxSizing: 'border-box',
                                lineHeight: '1.6',
                                outline: 'none',
                                backgroundColor: 'transparent',
                                color: '#2c3e50'
                            }}
                        />
                        <div style={{
                            position: 'absolute',
                            bottom: '12px',
                            right: '16px',
                            fontSize: '13px',
                            color: comment.length > 500 ? '#e74c3c' : '#95a5a6',
                            pointerEvents: 'none'
                        }}>
                            {comment.length} / 1000
                        </div>
                    </div>
                    <p style={{
                        fontSize: '13px',
                        color: '#6c757d',
                        marginTop: '8px',
                        marginBottom: 0
                    }}>
                        Tip: Include specific details about your visit to help others!
                    </p>
                </div>

                {error && (
                    <div style={{
                        padding: '14px 16px',
                        backgroundColor: '#fff3cd',
                        border: '1px solid #ffc107',
                        borderRadius: '8px',
                        color: '#856404',
                        marginBottom: '20px',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <span style={{ fontWeight: 'bold' }}>!</span>
                        <span>{error}</span>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={submitting}
                    style={{
                        padding: '14px 36px',
                        backgroundColor: submitting ? '#95a5a6' : '#27ae60',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: submitting ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: submitting ? 'none' : '0 2px 4px rgba(39, 174, 96, 0.2)'
                    }}
                    onMouseOver={(e) => !submitting && (e.currentTarget.style.backgroundColor = '#229954', e.currentTarget.style.transform = 'translateY(-1px)', e.currentTarget.style.boxShadow = '0 4px 8px rgba(39, 174, 96, 0.3)')}
                    onMouseOut={(e) => !submitting && (e.currentTarget.style.backgroundColor = '#27ae60', e.currentTarget.style.transform = 'translateY(0)', e.currentTarget.style.boxShadow = '0 2px 4px rgba(39, 174, 96, 0.2)')}
                >
                    {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
            </form>
        </div>
    );
};

export default ReviewForm;