import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { buildApiUrl } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { getDisplayUrl } from '../utils/wikipediaImageHelper';
import 'leaflet/dist/leaflet.css';
import { TrophySpin } from 'react-loading-indicators';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Park {
    _id: string;
    name: string;
    counties: string[];
    image_url: string;
    park_page: string;
    latitude: number;
    longitude: number;
    averageRating?: number;
    reviewCount?: number;
}



// Component to handle map bounds fitting
function FitBounds({ parks }: { parks: Park[] }) {
    const map = useMap();
    
    useEffect(() => {
        if (parks.length > 0) {
            const bounds = L.latLngBounds(
                parks.map(park => [park.latitude, park.longitude] as [number, number])
            );
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [parks, map]);
    
    return null;
}

const ParksMap: React.FC = () => {
    const [parks, setParks] = useState<Park[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [selectedCounty, setSelectedCounty] = useState<string>('all');
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchParks() {
            try {
                const response = await axios.get(buildApiUrl('parks'));
                // Filter parks that have coordinates
                const parksWithCoords = response.data.filter(
                    (park: Park) => park.latitude && park.longitude
                );
                setParks(parksWithCoords);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching parks:', err);
                setError('Failed to load parks');
                setLoading(false);
            }
        }
        fetchParks();
    }, []);

    // Get unique counties for filter
    const counties = ['all', ...Array.from(new Set(parks.flatMap(park => park.counties))).sort()];

    // Filter parks by county
    const filteredParks = selectedCounty === 'all' 
        ? parks 
        : parks.filter(park => park.counties.includes(selectedCounty));

    // Florida center coordinates
    const floridaCenter: [number, number] = [27.9944024, -81.7602544];


    if (loading) {
        return (
            <div style={{
                
                textAlign: 'center',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
            }}> 
                <TrophySpin color="#36d036" size="large" text="loading..." textColor="" />
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ 
                paddingTop: '100px',
                textAlign: 'center',
                color: '#e74c3c',
                fontSize: '18px'
            }}>
                {error}
            </div>
        );
    }

    return (
        <div style={{ 
            paddingTop: '80px', 
            padding: '20px',
            width: '100%',
            maxWidth: '1400px',
            margin: '0 auto'
        }}>
            {/* Header */}
            <div style={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <h1 style={{
                    fontSize: '32px',
                    fontWeight: 'bold',
                    color: '#2c3e50',
                    marginTop: 0,
                    marginBottom: '12px'
                }}>
                    Florida State Parks Map
                </h1>
                
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    flexWrap: 'wrap'
                }}>
                    <p style={{
                        fontSize: '16px',
                        color: '#6c757d',
                        margin: 0
                    }}>
                        Explore {filteredParks.length} parks across Florida
                    </p>

                    {/* County Filter */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <label style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#2c3e50'
                        }}>
                            Filter by County:
                        </label>
                        <select
                            value={selectedCounty}
                            onChange={(e) => setSelectedCounty(e.target.value)}
                            style={{
                                padding: '8px 16px',
                                fontSize: '14px',
                                border: '2px solid #e0e0e0',
                                borderRadius: '8px',
                                outline: 'none',
                                cursor: 'pointer',
                                backgroundColor: '#fff'
                            }}
                        >
                            <option value="all">All Counties ({parks.length})</option>
                            {counties.slice(1).map(county => {
                                const count = parks.filter(p => p.counties.includes(county)).length;
                                return (
                                    <option key={county} value={county}>
                                        {county} ({count})
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                </div>
            </div>

            {/* Map */}
            <div style={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <MapContainer 
                    center={floridaCenter} 
                    zoom={7}
                    style={{ 
                        height: '600px',
                        width: '100%'
                    }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    
                    {/* Fit bounds to show all filtered parks */}
                    <FitBounds parks={filteredParks} />

                    
                    {filteredParks.map((park) => (
                        <Marker 
                            key={park._id}
                            position={[park.latitude, park.longitude]}
                        >
                            <Popup maxWidth={300} minWidth={250}>
                                <div style={{ padding: '8px' }}>
                                    <img 
                                        src={getDisplayUrl(park.image_url)} 
                                        alt={park.name}
                                        style={{ 
                                            width: '100%', 
                                            height: '150px', 
                                            objectFit: 'cover',
                                            borderRadius: '8px',
                                            marginBottom: '12px'
                                        }}
                                    />
                                    <h3 style={{ 
                                        margin: '0 0 8px 0', 
                                        fontSize: '18px',
                                        color: '#2c3e50',
                                        fontWeight: '600'
                                    }}>
                                        {park.name}
                                    </h3>
                                    <p style={{ 
                                        margin: '0 0 8px 0', 
                                        color: '#666', 
                                        fontSize: '14px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}>
                                        {park.counties.join(', ')} County
                                    </p>
                                    {park.averageRating !== undefined && park.reviewCount !== undefined && park.reviewCount > 0 && (
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            marginBottom: '12px'
                                        }}>
                                            <span style={{
                                                fontSize: '18px',
                                                fontWeight: 'bold',
                                                color: '#1e3a5f'
                                            }}>
                                                {park.averageRating.toFixed(1)}
                                            </span>
                                            <span style={{ color: '#ffd700', fontSize: '16px' }}>
                                                {'★'.repeat(Math.round(park.averageRating))}
                                                {'☆'.repeat(5 - Math.round(park.averageRating))}
                                            </span>
                                            <span style={{ 
                                                fontSize: '13px', 
                                                color: '#6c757d' 
                                            }}>
                                                ({park.reviewCount} {park.reviewCount === 1 ? 'review' : 'reviews'})
                                            </span>
                                        </div>
                                    )}
                                    {(!park.reviewCount || park.reviewCount === 0) && (
                                        <div style={{
                                            padding: '8px 12px',
                                            backgroundColor: '#f8f9fa',
                                            borderRadius: '6px',
                                            marginBottom: '12px',
                                            fontSize: '13px',
                                            color: '#6c757d',
                                            fontStyle: 'italic',
                                            textAlign: 'center'
                                        }}>
                                            No reviews yet - be the first!
                                        </div>
                                    )}
                                    <button
                                        onClick={() => {
                                            console.log('Navigating to:', `/parks/${park._id}`);
                                            navigate(`/parks/${park._id}`);
                                        }}
                                        style={{
                                            width: '100%',
                                            padding: '10px 16px',
                                            backgroundColor: '#27ae60',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            transition: 'background-color 0.3s'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#229954'}
                                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#27ae60'}
                                    >
                                        View Park Details
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>

        </div>
    );
};

export default ParksMap;
