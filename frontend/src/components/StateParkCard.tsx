import React from 'react';
import './StateParkCard.css';

interface StateParkProps {
    name: string;
    counties: string[];
    image_url: string;
    park_page: string;
}

const StateParkCard: React.FC<StateParkProps> = ({ name, counties, image_url, park_page }) => {
    return (
        <div className="state-park-card">
            <img src={image_url} alt={name} className="state-park-image" />
            <div className="state-park-info">
                <h2 className="state-park-name">{name}</h2>
                <p className="state-park-counties">
                    <strong>County:</strong> {counties.join(', ')}
                </p>
                <a href={park_page} target="_blank" rel="noopener noreferrer" className="state-park-link">
                    Learn More
                </a>
            </div>
        </div>
    );
};

export default StateParkCard;