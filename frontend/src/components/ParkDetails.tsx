import axios from 'axios';
import { useParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import ReviewsList from './ReviewsList';
import ReviewForm from './ReviewForm';
import { buildApiUrl } from '../utils/api';
import type { RatingSet, Review } from '../types/Review';

interface Park {
    _id: string;
    name: string;
    counties: string[];
    image_url: string;
    park_page: string;
    averageRating?: number;
    reviewCount?: number;
    ratingBreakdown?: RatingSet;
}

const ParkDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [park, setPark] = useState<Park | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    const fetchParkDetails = async () => {
        try {
            const parkResponse = await axios.get(buildApiUrl(`parks/${id}`));
            setPark(parkResponse.data);

            const reviewsResponse = await axios.get(buildApiUrl(`parks/${id}/reviews`));
            setReviews(reviewsResponse.data);
        } catch (err) {
            console.error('Error fetching park details:', err);
            setError('Failed to load park details.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchParkDetails();
    }, [id]);

    const handleReviewSubmitted = () => {
        fetchParkDetails();
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '400px',
                fontSize: '18px',
                color: '#6c757d',
                paddingTop: '80px'
            }}>
                Loading park details...
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                maxWidth: '600px',
                margin: '40px auto',
                padding: '20px',
                backgroundColor: '#fff3cd',
                border: '1px solid #ffc107',
                borderRadius: '8px',
                color: '#856404',
                marginTop: '100px'
            }}>
                {error}
            </div>
        );
    }

    if (!park) {
        return (
            <div style={{
                maxWidth: '600px',
                margin: '40px auto',
                padding: '20px',
                backgroundColor: '#fff',
                borderRadius: '8px',
                textAlign: 'center',
                color: '#6c757d',
                marginTop: '100px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                Park not found.
            </div>
        );
    }

    return (
        <div style={{ 
            maxWidth: '1000px', 
            margin: '0 auto', 
            padding: '20px',
            paddingTop: '100px',
            minHeight: '100vh'
        }}>
            <div style={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                marginBottom: '30px'
            }}>
                <img 
                    src={park.image_url} 
                    alt={park.name} 
                    style={{ 
                        width: '100%', 
                        height: '400px',
                        objectFit: 'cover'
                    }} 
                />
                
                <div style={{ padding: '30px' }}>
                    <h1 style={{ 
                        fontSize: '36px', 
                        fontWeight: 'bold', 
                        color: '#2c3e50',
                        marginBottom: '20px',
                        marginTop: 0
                    }}>
                        {park.name}
                    </h1>
                    
                    <div style={{
                        display: 'flex',
                        gap: '30px',
                        flexWrap: 'wrap',
                        marginBottom: '20px'
                    }}>
                        <div>
                            <span style={{ 
                                fontSize: '14px', 
                                color: '#6c757d',
                                display: 'block',
                                marginBottom: '4px'
                            }}>
                                Counties
                            </span>
                            <span style={{ 
                                fontSize: '16px', 
                                color: '#2c3e50',
                                fontWeight: '500'
                            }}>
                                {park.counties.join(', ')}
                            </span>
                        </div>
                        
                        <div>
                            <span style={{ 
                                fontSize: '14px', 
                                color: '#6c757d',
                                display: 'block',
                                marginBottom: '4px'
                            }}>
                                Total Ratings
                            </span>
                            <span style={{ 
                                fontSize: '16px', 
                                color: '#2c3e50',
                                fontWeight: '500'
                            }}>
                                {park.reviewCount || 'No ratings yet'}
                            </span>
                        </div>
                    </div>

                    {park.ratingBreakdown && park.reviewCount && park.reviewCount > 0 && (
                        <div style={{ marginTop: '30px' }}>
                            <h3 style={{ 
                                fontSize: '20px', 
                                fontWeight: 'bold', 
                                color: '#2c3e50',
                                marginBottom: '16px'
                            }}>
                                Average Ratings
                            </h3>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                                gap: '12px',
                                padding: '20px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '8px'
                            }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '4px' }}>Views</div>
                                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                                        <span style={{ color: '#2c3e50' }}>{park.ratingBreakdown.views.toFixed(1)}</span>
                                        <span style={{ color: '#f1c40f' }}>★</span>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '4px' }}>Location</div>
                                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                                        <span style={{ color: '#2c3e50' }}>{park.ratingBreakdown.location.toFixed(1)}</span>
                                        <span style={{ color: '#f1c40f' }}>★</span>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '4px' }}>Amenities</div>
                                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                                        <span style={{ color: '#2c3e50' }}>{park.ratingBreakdown.amenities.toFixed(1)}</span>
                                        <span style={{ color: '#f1c40f' }}>★</span>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '4px' }}>Overall</div>
                                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                                        <span style={{ color: '#2c3e50' }}>{park.averageRating?.toFixed(1)}</span>
                                        <span style={{ color: '#f1c40f' }}>★</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <a 
                        href={park.park_page} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{
                            display: 'inline-block',
                            marginTop: '24px',
                            padding: '12px 24px',
                            backgroundColor: '#27ae60',
                            color: '#fff',
                            textDecoration: 'none',
                            borderRadius: '6px',
                            fontWeight: '500',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#229954'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#27ae60'}
                    >
                        Visit Official Park Page →
                    </a>
                </div>
            </div>

            {id && <ReviewForm parkId={id} onReviewSubmitted={handleReviewSubmitted} />}

            <ReviewsList reviews={reviews} onReviewUpdated={fetchParkDetails} parkId={id || ''} />
        </div>
    );
};

export default ParkDetails;