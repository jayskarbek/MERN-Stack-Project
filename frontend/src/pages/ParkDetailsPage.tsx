import ParkDetails from '../components/ParkDetails'; 
import LoggedInName from '../components/LoggedInName';

const ParkDetailsPage = () => {
    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f8f9fa'
        }}>
            <LoggedInName />
            <div style={{ paddingTop: '80px' }}>
                <ParkDetails /> 
            </div>
        </div>
    );
};

export default ParkDetailsPage;