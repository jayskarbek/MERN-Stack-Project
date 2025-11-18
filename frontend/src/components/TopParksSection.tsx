import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getDisplayUrl } from '../utils/wikipediaImageHelper';

interface Park {
    _id: string;
    name: string;
    counties: string[];
    image_url: string;
}

interface TopPark {
    park: Park;
    rating: number;
    reviewDate: string;
}

interface TopParksSectionProps {
    topParks: TopPark[];
}

const TopParksSection: React.FC<TopParksSectionProps> = ({ topParks }) => {
    const navigate = useNavigate();

    if (topParks.length === 0) {
        return null;
    }

    return (
        <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '30px',
            marginBottom: '30px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
            <h2 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#2c3e50',
                marginTop: 0,
                marginBottom: '20px'
            }}>
                Top Rated Parks
            </h2>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '20px'
            }}>
                {topParks.map((topPark, index) => (
                    <div
                        key={topPark.park._id}
                        onClick={() => navigate(`/parks/${topPark.park._id}`)}
                        style={{
                            cursor: 'pointer',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            position: 'relative'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                        }}
                    >
                        <img
                            src={getDisplayUrl(topPark.park.image_url)}
                            alt={topPark.park.name}
                            style={{
                                width: '100%',
                                height: '150px',
                                objectFit: 'cover'
                            }}
                        />
                        <div style={{ padding: '12px' }}>
                            <h3 style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                color: '#2c3e50',
                                margin: '0 0 8px 0',
                                lineHeight: '1.3'
                            }}>
                                {topPark.park.name}
                            </h3>
                            <div style={{
                                textAlign: 'center',
                                marginBottom: '4px'
                            }}>
                                <span style={{
                                    fontSize: '20px',
                                    fontWeight: 'bold',
                                    color: '#000000FF'
                                }}>
                                    {topPark.rating.toFixed(1)} <span style={{ color: '#f4c542' }}>★</span>
                                </span>
                            </div>

                            <p style={{
                                fontSize: '12px',
                                color: '#2A3030FF',
                                margin: 0
                            }}>
                                {topPark.park.counties.join(', ')}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TopParksSection;
