import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { auth } from '../utils/auth';
import { buildApiUrl } from '../utils/api';
import { TrophySpin } from 'react-loading-indicators';
import ProfileHeader from '../components/ProfileHeader';
import TopParksSection from '../components/TopParksSection';
import ProfileReviewsSection from '../components/ProfileReviewsSection';

interface Park {
    _id: string;
    name: string;
    counties: string[];
    image_url: string;
}

interface Review {
    _id: string;
    parkId: string;
    comment: string;
    ratings: {
        views: number;
        location: number;
        amenities: number;
    };
    createdAt: string;
    park: Park | null;
}

interface TopPark {
    park: Park;
    rating: number;
    reviewDate: string;
}

interface UserProfile {
    user: {
        userId: string;
        firstName: string;
        lastName: string;
        email: string | null;
        memberSince: string | null;
    };
    stats: {
        totalReviews: number;
        parksVisited: number;
        averageRatingGiven: number;
    };
    topParks: TopPark[];
    recentReviews: Review[];
    allReviews: Review[];
    isOwnProfile: boolean;
}

const ProfilePage: React.FC = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { userId } = useParams<{ userId?: string }>();

    useEffect(() => {
        fetchProfile();
    }, [userId]);

    const fetchProfile = async () => {
        try {
            // If userId is provided in URL, fetch that user's public profile
            // Otherwise, fetch logged-in user's own profile
            if (userId) {
                // Public profile - no auth needed
                const response = await axios.get(buildApiUrl(`profile/${userId}`));
                setProfile(response.data);
            } else {
                // Own profile - requires auth
                const token = auth.getToken();
                if (!token) {
                    navigate('/');
                    return;
                }

                const response = await axios.get(buildApiUrl('profile'), {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setProfile(response.data);
            }
            setLoading(false);
        } catch (err) {
            console.error('Error fetching profile:', err);
            setError('Failed to load profile');
            setLoading(false);
        }
    };

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

    if (error || !profile) {
        return (
            <div style={{
                paddingTop: '100px',
                textAlign: 'center',
                color: '#e74c3c',
                fontSize: '18px'
            }}>
                {error || 'Failed to load profile'}
            </div>
        );
    }

    return (
        <div style={{
            paddingTop: '100px',
            padding: '20px',
            maxWidth: '1200px',
            margin: '0 auto',
            minHeight: '100vh'
        }}>
            <ProfileHeader
                firstName={profile.user.firstName}
                lastName={profile.user.lastName}
                email={profile.user.email}
                memberSince={profile.user.memberSince}
                totalReviews={profile.stats.totalReviews}
                parksVisited={profile.stats.parksVisited}
                averageRating={profile.stats.averageRatingGiven}
            />

            <TopParksSection topParks={profile.topParks} />

            <ProfileReviewsSection
                recentReviews={profile.recentReviews}
                allReviews={profile.allReviews}
            />
        </div>
    );
};

export default ProfilePage;
