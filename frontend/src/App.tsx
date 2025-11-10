import { Route, Navigate, Routes } from 'react-router-dom';
import './App.css';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CardPage from './pages/CardPage.tsx';
import ParkDetailsPage from './pages/ParkDetailsPage';
import { auth } from './utils/auth';
import VerifyEmail from './components/VerifyEmail';
import ForgotPassPage from './pages/ForgotPassPage';
import ResetPassPage from './pages/ResetPassPage';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
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
            <Route path="/forgotpass" element={<ForgotPassPage />} />
            <Route path="/resetpass" element={<ResetPassPage />} />
            <Route path="/verify/:token" element={<VerifyEmail />} />
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