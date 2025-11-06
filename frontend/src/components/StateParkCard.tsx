import React from 'react';
import { Link } from 'react-router-dom';
import './StateParkCard.css';

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
    park_page,
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

    return (
        <Link to={`/parks/${id}`} className="state-park-card-link">
            <div className="state-park-card">
                <img src={image_url} alt={name} className="state-park-image" />
                <div className="state-park-info">
                    <h2 className="state-park-name">{name}</h2>
                    
                    {/* Rating Section */}
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        marginBottom: '8px',
                        fontSize: '16px'
                    }}>
                        <div style={{ display: 'flex', gap: '2px' }}>
                            {renderStars(averageRating)}
                        </div>
                        <span style={{ 
                            fontWeight: '600', 
                            color: '#2c3e50',
                            fontSize: '15px'
                        }}>
                            {averageRating > 0 ? averageRating.toFixed(1) : 'No ratings'}
                        </span>
                        {reviewCount > 0 && (
                            <span style={{ 
                                color: '#6c757d',
                                fontSize: '14px'
                            }}>
                                ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
                            </span>
                        )}
                    </div>

                    <p className="state-park-counties">
                        <strong>County:</strong> {counties.join(', ')}
                    </p>
                    <a href={park_page} target="_blank" rel="noopener noreferrer" className="state-park-link">
                        Learn More
                    </a>
                </div>
            </div>
        </Link>
    );
};

export default StateParkCard;