import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StateParkCard from './StateParkCard';

interface Park {
    _id: string;
    name: string;
    counties: string[];
    image_url: string;
    park_page: string;
}

const StateParkList: React.FC = () => {
    const [parks, setParks] = useState<Park[]>([]);
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);

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

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    if (parks.length === 0) {
        return <div>No parks available.</div>;
    }

    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px', padding: '20px' }}>
            {parks.map((park) => (
                <StateParkCard
                    key={park._id}
                    name={park.name}
                    counties={park.counties}
                    image_url={park.image_url}
                    park_page={park.park_page}
                />
            ))}
        </div>
    );
};

export default StateParkList;