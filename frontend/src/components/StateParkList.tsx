import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StateParkCard from './StateParkCard';
import ParkSearchFilter from './ParkSearch';
import { auth } from '../utils/auth';
import { buildApiUrl } from '../utils/api';

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
    const [allParks, setAllParks] = useState<Park[]>([]); // Keep all parks for county list
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [loadingReviewed, setLoadingReviewed] = useState<boolean>(false);
    const [isSearching, setIsSearching] = useState<boolean>(false); // Track if search is in progress
    
    // Search and filter states
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [sortBy, setSortBy] = useState<SortOption>('name-asc');
    const [selectedCounty, setSelectedCounty] = useState<string>('all');
    const [showMyReviews, setShowMyReviews] = useState<boolean>(false);

    // Initial load - get all parks for county list
    useEffect(() => {
        async function fetchAllParks() {
            try {
                const response = await axios.get(buildApiUrl('parks'));
                setAllParks(response.data);
                setParks(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching parks:', err);
                setError('Failed to load parks. Please try again later.');
                setLoading(false);
            }
        }

        fetchAllParks();
    }, []);

    useEffect(() => {
        // Don't search if showing reviewed parks
        if (showMyReviews) return;

        // Create abort controller to cancel previous requests
        const abortController = new AbortController();

        async function searchParks() {
            try {
                setIsSearching(true);
                
                // Build query parameters
                const params: any = {
                    sort: sortBy
                };

                if (searchTerm.trim() !== '') {
                    params.query = searchTerm.trim();
                }

                if (selectedCounty !== 'all') {
                    params.county = selectedCounty;
                }

                const response = await axios.get(buildApiUrl('parks/search'), { 
                    params,
                    signal: abortController.signal
                });
                
                console.log('server returned', response.data.length, 'parks');
                setParks(response.data);
                setLoading(false);
                setIsSearching(false);
            } catch (err: any) {
                // Don't show error if request was cancelled
                if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
                    return;
                }
                console.error('Error searching parks:', err);
                setError('Failed to search parks. Please try again.');
                setLoading(false);
                setIsSearching(false);
            }
        }

        searchParks();

        // Cancel the request if component unmounts or search changes
        return () => {
            abortController.abort();
        };
    }, [searchTerm, sortBy, selectedCounty, showMyReviews]);

    // Fetch reviewed parks when toggled
    useEffect(() => {
        async function fetchReviewedParks() {
            if (!showMyReviews || !auth.isAuthenticated()) {
                return;
            }

            setLoadingReviewed(true);
            try {
                const token = auth.getToken();
                const response = await axios.get(buildApiUrl('my-reviewed-parks'), {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                console.log('Found', response.data.length, 'reviewed parks');
                setParks(response.data);
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
    const counties = ['all', ...Array.from(new Set(allParks.flatMap(park => park.counties))).sort()];

    const handleClearFilters = () => {
        setSearchTerm('');
        setSortBy('name-asc');
        setSelectedCounty('all');
        setShowMyReviews(false);
    };

    const showClearButton = searchTerm || selectedCounty !== 'all' || sortBy !== 'name-asc' || showMyReviews;

    if (loading && !loadingReviewed) {
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
            <ParkSearchFilter
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedCounty={selectedCounty}
                setSelectedCounty={setSelectedCounty}
                sortBy={sortBy}
                setSortBy={(value: string) => setSortBy(value as SortOption)}
                counties={counties}
                resultsCount={parks.length}
                totalCount={allParks.length}
                onClearFilters={handleClearFilters}
                showClearButton={Boolean(showClearButton)}
                showMyReviews={showMyReviews}
                setShowMyReviews={setShowMyReviews}
                isSearching={isSearching}
            />

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

            {!loadingReviewed && parks.length === 0 ? (
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
                    {parks.map((park) => (
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