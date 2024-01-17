import { AppContextProvider } from './components/contexts/app-context-provider';
import Footer from './components/footer';
import Header from './components/header';
import MainView from './components/main-view';
import SideBar from './components/side-bar';


function App() {
    return (
        <AppContextProvider>
            <Header />
            <div className={"flex flex-grow"}>
                <SideBar />
                <MainView />
            </div>
            <Footer />
        </AppContextProvider>
    )
}


export default App;


