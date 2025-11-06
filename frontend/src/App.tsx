import { Route, Navigate, Routes } from 'react-router-dom';
import './App.css';
import LoginPage from './pages/LoginPage.tsx';
import RegisterPage from './pages/RegisterPage.tsx';
import CardPage from './pages/CardPage.tsx';
import ParkDetailsPage from './pages/ParkDetailsPage.tsx';
import { auth } from './utils/auth';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    if (!auth.isAuthenticated()) {
        return <Navigate to="/" replace />;
    }
    return children;
};

function App() {
    return (
        <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route 
                path="/CardPage" 
                element={
                    <ProtectedRoute>
                        <CardPage />
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/parks/:id" 
                element={
                    <ProtectedRoute>
                        <ParkDetailsPage />
                    </ProtectedRoute>
                } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;