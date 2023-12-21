import { FluentProvider, mergeClasses } from '@fluentui/react-components';
import { useStyle, useTheme } from './components/theme/use-theme';
import { AppContextProvider } from './contexts/app-context-provider';
import Footer from './components/footer';
import Header from './components/header';
import MainView from './components/main-view';
import SideBar from './components/side-bar';



function App() {
  const theme = useTheme();
  const style = useStyle();
  return (
    <FluentProvider theme={theme} className={mergeClasses(style.root)}>
      <AppContextProvider>
        <Header className={mergeClasses(style.header)} />
        <div className={"flex flex-grow"}>
          <SideBar className={mergeClasses(style.sideBar)} />
          <MainView />
        </div>
        <Footer />
      </AppContextProvider>
    </FluentProvider>
  )
}

export default App
