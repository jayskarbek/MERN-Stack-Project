import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import StateParkCard from './StateParkCard';
import ParkSearchFilter from './ParkSearch';
import { auth } from '../utils/auth';

interface Park {
    _id: string;
    name: string;
    counties: string[];
    image_url: string;
    park_page: string;
    averageRating?: number;
    reviewCount?: number;
}

type SortOption = 'name-asc' | 'name-desc' | 'county-asc' | 'county-desc' | 'rating-desc' | 'rating-asc';

const StateParkList: React.FC = () => {
    const [parks, setParks] = useState<Park[]>([]);
    const [reviewedParks, setReviewedParks] = useState<Park[]>([]);
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [loadingReviewed, setLoadingReviewed] = useState<boolean>(false);
    
    // Search and filter states
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [sortBy, setSortBy] = useState<SortOption>('name-asc');
    const [selectedCounty, setSelectedCounty] = useState<string>('all');
    const [showMyReviews, setShowMyReviews] = useState<boolean>(false);

    useEffect(() => {
        async function fetchParks() {
            try {
                const response = await axios.get('http://localhost:5000/api/parks');
                setParks(response.data);
            } catch (err) {
                console.error('Error fetching parks:', err);
                setError('Failed to load parks. Please try again later.');
            } finally {
                setLoading(false);
            }
        }

        fetchParks();
    }, []);

    useEffect(() => {
        async function fetchReviewedParks() {
            if (!showMyReviews || !auth.isAuthenticated()) {
                return;
            }

            setLoadingReviewed(true);
            try {
                const token = auth.getToken();
                const response = await axios.get('http://localhost:5000/api/my-reviewed-parks', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setReviewedParks(response.data);
            } catch (err) {
                console.error('Error fetching reviewed parks:', err);
                setError('Failed to load your reviewed parks.');
            } finally {
                setLoadingReviewed(false);
            }
        }

        fetchReviewedParks();
    }, [showMyReviews]);

    // Get unique counties for filter dropdown
    const counties = useMemo(() => {
        const allCounties = parks.flatMap(park => park.counties);
        return ['all', ...Array.from(new Set(allCounties)).sort()];
    }, [parks]);

    // Determine which parks to display
    const displayParks = showMyReviews ? reviewedParks : parks;

    // Filter and sort parks
    const filteredAndSortedParks = useMemo(() => {
        let filtered = displayParks;

        // Filter by search term
        if (searchTerm.trim()) {
            filtered = filtered.filter(park =>
                park.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                park.counties.some(county => 
                    county.toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        }

        // Filter by county
        if (selectedCounty !== 'all') {
            filtered = filtered.filter(park =>
                park.counties.includes(selectedCounty)
            );
        }

        // Sort parks
        const sorted = [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'name-asc':
                    return a.name.localeCompare(b.name);
                case 'name-desc':
                    return b.name.localeCompare(a.name);
                case 'county-asc':
                    return a.counties[0].localeCompare(b.counties[0]);
                case 'county-desc':
                    return b.counties[0].localeCompare(a.counties[0]);
                case 'rating-desc':
                    return (b.averageRating || 0) - (a.averageRating || 0);
                case 'rating-asc':
                    return (a.averageRating || 0) - (b.averageRating || 0);
                default:
                    return 0;
            }
        });

        return sorted;
    }, [displayParks, searchTerm, sortBy, selectedCounty]);

    const handleClearFilters = () => {
        setSearchTerm('');
        setSortBy('name-asc');
        setSelectedCounty('all');
        setShowMyReviews(false);
    };

    const showClearButton = searchTerm || selectedCounty !== 'all' || sortBy !== 'name-asc' || showMyReviews;

    if (loading) {
        return (
            <div style={{ 
                paddingTop: '100px', 
                textAlign: 'center',
                fontSize: '18px',
                color: '#666'
            }}>
                Loading parks...
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
        <div style={{ paddingTop: '80px', padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Search and Filter Component */}
            <ParkSearchFilter
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedCounty={selectedCounty}
                setSelectedCounty={setSelectedCounty}
                sortBy={sortBy}
                setSortBy={(value: string) => setSortBy(value as SortOption)}
                counties={counties}
                resultsCount={filteredAndSortedParks.length}
                totalCount={parks.length}
                onClearFilters={handleClearFilters}
                showClearButton={Boolean(showClearButton)}
                showMyReviews={showMyReviews}
                setShowMyReviews={setShowMyReviews}
            />

            {/* Loading State for My Reviews */}
            {loadingReviewed && (
                <div style={{
                    padding: '40px',
                    textAlign: 'center',
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    marginBottom: '20px'
                }}>
                    <p style={{ fontSize: '16px', color: '#6c757d' }}>
                        Loading your reviewed parks...
                    </p>
                </div>
            )}

            {/* Parks Grid */}
            {!loadingReviewed && filteredAndSortedParks.length === 0 ? (
                <div style={{
                    padding: '60px 20px',
                    textAlign: 'center',
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <h3 style={{ 
                        fontSize: '24px', 
                        color: '#2c3e50',
                        marginBottom: '12px'
                    }}>
                        {showMyReviews ? "You haven't reviewed any parks yet" : "No parks found"}
                    </h3>
                    <p style={{ 
                        fontSize: '16px', 
                        color: '#6c757d',
                        marginBottom: '24px'
                    }}>
                        {showMyReviews 
                            ? "Start exploring and leave your first review!" 
                            : "Try adjusting your search or filters"}
                    </p>
                    <button
                        onClick={handleClearFilters}
                        style={{
                            padding: '12px 24px',
                            fontSize: '15px',
                            backgroundColor: '#27ae60',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            transition: 'background-color 0.3s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#229954'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#27ae60'}
                    >
                        {showMyReviews ? "View All Parks" : "Clear All Filters"}
                    </button>
                </div>
            ) : (
                <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '24px',
                    padding: '0 0 40px 0'
                }}>
                    {filteredAndSortedParks.map((park) => (
                        <StateParkCard
                            key={park._id}
                            id={park._id}
                            name={park.name}
                            counties={park.counties}
                            image_url={park.image_url}
                            park_page={park.park_page}
                            averageRating={park.averageRating}
                            reviewCount={park.reviewCount}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default StateParkList;