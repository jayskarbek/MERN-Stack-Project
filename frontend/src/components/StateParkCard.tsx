import React from 'react';
import { Link } from 'react-router-dom';
import './StateParkCard.css';
import { getDisplayUrl } from '../utils/wikipediaImageHelper';

interface StateParkProps {
    id: string;
    name: string;
    counties: string[];
    image_url: string;
    park_page: string;
    averageRating?: number;
    reviewCount?: number;
}

const StateParkCard: React.FC<StateParkProps> = ({ 
    id, 
    name, 
    counties, 
    image_url,
    averageRating = 0,
    reviewCount = 0
}) => {
    // Render star rating
    const renderStars = (rating: number) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        
        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(<span key={i} style={{ color: '#f39c12' }}>★</span>);
            } else if (i === fullStars && hasHalfStar) {
                stars.push(<span key={i} style={{ color: '#f39c12' }}>★</span>);
            } else {
                stars.push(<span key={i} style={{ color: '#d1d5db' }}>☆</span>);
            }
        }
        return stars;
    };

    const displayImageUrl = getDisplayUrl(image_url);

    return (
        <Link to={`/parks/${id}`} className="state-park-card-link">
            <div className="state-park-card">
                <div className="state-park-image-container">
                    <img src={displayImageUrl} alt={name} className="state-park-image" />
                    <div className="state-park-overlay">
                        <div className="overlay-content">
                            <div className="park-rating-badge">
                                <span className="rating-number">
                                    {averageRating > 0 ? averageRating.toFixed(1) : '—'}
                                </span>
                                <div className="rating-stars">
                                    {renderStars(averageRating)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="state-park-info">
                    <h3 className="state-park-name">{name}</h3>
                    <p className="state-park-county">{counties.join(', ')}</p>
                    {reviewCount > 0 && (
                        <p className="state-park-reviews">
                            {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
                        </p>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default StateParkCard;