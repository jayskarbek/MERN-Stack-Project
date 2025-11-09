import React from 'react';
import { auth } from '../utils/auth';

interface ParkSearchFilterProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    selectedCounty: string;
    setSelectedCounty: (value: string) => void;
    sortBy: string;
    setSortBy: (value: string) => void;
    counties: string[];
    resultsCount: number;
    totalCount: number;
    onClearFilters: () => void;
    showClearButton: boolean;
    showMyReviews: boolean;
    setShowMyReviews: (value: boolean) => void;
}

const ParkSearchFilter: React.FC<ParkSearchFilterProps> = ({
    searchTerm,
    setSearchTerm,
    selectedCounty,
    setSelectedCounty,
    sortBy,
    setSortBy,
    counties,
    resultsCount,
    totalCount,
    onClearFilters,
    showClearButton,
    showMyReviews,
    setShowMyReviews
}) => {
    const isAuthenticated = auth.isAuthenticated();

    return (
        <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '30px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0'
        }}>
            <h2 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#2c3e50',
                marginTop: 0,
                marginBottom: '20px'
            }}>
                Find Your Perfect Park
            </h2>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '16px',
                alignItems: 'end'
            }}>
                {/* Search Input */}
                <div style={{ flex: '2', minWidth: '250px' }}>
                    <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#2c3e50',
                        marginBottom: '8px'
                    }}>
                        Search Parks
                    </label>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Search by park name or county..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 40px 12px 16px',
                                fontSize: '15px',
                                border: '2px solid #e0e0e0',
                                borderRadius: '8px',
                                outline: 'none',
                                transition: 'border-color 0.3s',
                                boxSizing: 'border-box'
                            }}
                            onFocus={(e) => e.currentTarget.style.borderColor = '#27ae60'}
                            onBlur={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '20px',
                                    color: '#999',
                                    padding: '0 4px'
                                }}
                            >
                                ×
                            </button>
                        )}
                    </div>
                </div>

                {/* County Filter */}
                <div style={{ flex: '1', minWidth: '200px' }}>
                    <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#2c3e50',
                        marginBottom: '8px'
                    }}>
                        Filter by County
                    </label>
                    <select
                        value={selectedCounty}
                        onChange={(e) => setSelectedCounty(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            fontSize: '15px',
                            border: '2px solid #e0e0e0',
                            borderRadius: '8px',
                            outline: 'none',
                            cursor: 'pointer',
                            backgroundColor: '#fff',
                            transition: 'border-color 0.3s',
                            boxSizing: 'border-box'
                        }}
                        onFocus={(e) => e.currentTarget.style.borderColor = '#27ae60'}
                        onBlur={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}
                    >
                        <option value="all">All Counties</option>
                        {counties.slice(1).map(county => (
                            <option key={county} value={county}>{county}</option>
                        ))}
                    </select>
                </div>

                {/* Sort By */}
                <div style={{ flex: '1', minWidth: '200px' }}>
                    <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#2c3e50',
                        marginBottom: '8px'
                    }}>
                        Sort By
                    </label>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            fontSize: '15px',
                            border: '2px solid #e0e0e0',
                            borderRadius: '8px',
                            outline: 'none',
                            cursor: 'pointer',
                            backgroundColor: '#fff',
                            transition: 'border-color 0.3s',
                            boxSizing: 'border-box'
                        }}
                        onFocus={(e) => e.currentTarget.style.borderColor = '#27ae60'}
                        onBlur={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}
                    >
                        <option value="name-asc">Name (A-Z)</option>
                        <option value="name-desc">Name (Z-A)</option>
                        <option value="county-asc">County (A-Z)</option>
                        <option value="county-desc">County (Z-A)</option>
                        <option value="rating-desc">Rating (High to Low)</option>
                        <option value="rating-asc">Rating (Low to High)</option>
                    </select>
                </div>

                {/* Clear Filters Button */}
                {showClearButton && (
                    <div style={{ flex: '0 0 auto' }}>
                        <button
                            onClick={onClearFilters}
                            style={{
                                padding: '12px 20px',
                                fontSize: '14px',
                                backgroundColor: '#e74c3c',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                transition: 'background-color 0.3s',
                                whiteSpace: 'nowrap',
                                marginTop: '28px'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#c0392b'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#e74c3c'}
                        >
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>

            {/* My Reviews Toggle */}
            {isAuthenticated && (
                <div style={{
                    marginTop: '20px',
                    padding: '16px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <input
                        type="checkbox"
                        id="myReviewsFilter"
                        checked={showMyReviews}
                        onChange={(e) => setShowMyReviews(e.target.checked)}
                        style={{
                            width: '20px',
                            height: '20px',
                            cursor: 'pointer'
                        }}
                    />
                    <label 
                        htmlFor="myReviewsFilter"
                        style={{
                            fontSize: '15px',
                            fontWeight: '500',
                            color: '#2c3e50',
                            cursor: 'pointer',
                            userSelect: 'none'
                        }}
                    >
                        Show only parks I've reviewed
                    </label>
                </div>
            )}

            {/* Results Count */}
            <div style={{
                marginTop: '16px',
                padding: '12px 16px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#6c757d',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <span>
                    <strong style={{ color: '#27ae60' }}>{resultsCount}</strong> 
                    {' '}park{resultsCount !== 1 ? 's' : ''} found
                    {searchTerm && ` for "${searchTerm}"`}
                    {showMyReviews && ' (your reviews)'}
                </span>
                {totalCount > 0 && (
                    <span style={{ fontSize: '13px' }}>
                        Total: {totalCount} parks
                    </span>
                )}
            </div>
        </div>
    );
};

export default ParkSearchFilter;