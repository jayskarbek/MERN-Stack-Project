import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const VerifyEmailPage: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const [message, setMessage] = useState('Verifying your email...');
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                const response = await fetch(`/api/verify/${token}`);
                const data = await response.json();

                if (response.ok) {
                    setMessage(data.message);
                    setIsSuccess(true);
                    setTimeout(() => navigate('/'), 3000);
                } else {
                    setMessage(data.error || 'Verification failed');
                    setIsSuccess(false);
                }
            } catch (err) {
                setMessage('Error verifying email');
                setIsSuccess(false);
            }
        };

        verifyEmail();
    }, [token, navigate]);

    return (
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
            <h2>{message}</h2>
            {isSuccess && <p>Redirecting to login...</p>}
        </div>
    );
};

export default VerifyEmailPage;