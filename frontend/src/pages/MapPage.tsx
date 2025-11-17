import PageTitle from '../components/PageTitle';
import LoggedInName from '../components/LoggedInName';
import ParksMap from '../components/ParksMap';

const MapPage = () => {
    return (
        <div>
            <PageTitle />
            <LoggedInName />
            <ParksMap />
        </div>
    );
}

export default MapPage;
