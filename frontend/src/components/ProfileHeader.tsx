import React from 'react';

interface ProfileHeaderProps {
    firstName: string;
    lastName: string;
    email: string | null;
    memberSince: string | null;
    totalReviews: number;
    parksVisited: number;
    averageRating: number;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
    firstName,
    lastName,
    email,
    memberSince,
    totalReviews,
    parksVisited,
    averageRating
}) => {
    return (
        <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '40px',
            marginBottom: '30px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '30px',
            flexWrap: 'wrap'
        }}>

            {/* User Info */}
            <div style={{ flex: 1, minWidth: '250px' }}>
                <h1 style={{
                    fontSize: '36px',
                    fontWeight: 'bold',
                    color: '#2c3e50',
                    margin: '0 0 8px 0'
                }}>
                    {firstName} {lastName}
                </h1>
                {email && (
                    <p style={{
                        fontSize: '16px',
                        color: '#6c757d',
                        margin: '0 0 4px 0'
                    }}>
                        {email}
                    </p>
                )}
                {memberSince && (
                    <p style={{
                        fontSize: '14px',
                        color: '#95a5a6',
                        margin: 0
                    }}>
                        Member since {new Date(memberSince).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long'
                        })}
                    </p>
                )}
            </div>

            {/* Stats */}
            <div style={{
                display: 'flex',
                gap: '30px',
                flexWrap: 'wrap'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        fontSize: '32px',
                        fontWeight: 'bold',
                        color: '#2c3e50'
                    }}>
                        {totalReviews}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6c757d' }}>
                        Reviews
                    </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        fontSize: '32px',
                        fontWeight: 'bold',
                        color: '#2c3e50'
                    }}>
                        {parksVisited}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6c757d' }}>
                        Parks
                    </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        fontSize: '32px',
                        fontWeight: 'bold',
                        color: '#000000FF'
                    }}>
                        {averageRating.toFixed(1)} 
                        <span style={{ color: '#f4c542' }}>★</span>
                    </div>
                    <div style={{ fontSize: '14px', color: '#6c757d' }}>
                        Avg Rating
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileHeader;
