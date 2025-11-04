import PageTitle from '../components/PageTitle';
import LoggedInName from '../components/LoggedInName';
import StateParkList from '../components/StateParkList';

const CardPage = () => {
    return (
        <div>
            <PageTitle />
            <LoggedInName />
            <StateParkList />
        </div>
    );
}

export default CardPage;
