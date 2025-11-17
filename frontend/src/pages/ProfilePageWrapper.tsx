import PageTitle from '../components/PageTitle';
import LoggedInName from '../components/LoggedInName';
import ProfilePage from './ProfilePage';

const ProfilePageWrapper = () => {
    return (
        <div>
            <PageTitle />
            <LoggedInName />
            <ProfilePage />
        </div>
    );
}

export default ProfilePageWrapper;
