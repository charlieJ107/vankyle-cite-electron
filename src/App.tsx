import Footer from './components/footer';
import { FluentProvider, mergeClasses } from '@fluentui/react-components';
import Header from './components/header';
import Query from './components/query';
import Library from './components/library';
import Panel from './components/panel';
import SideBar from './components/side-bar';
import { useStyle, useTheme } from './components/theme/use-theme';
import { PaperContext } from './components/paper-context/paper-context';



function App() {
  const theme = useTheme();
  const style = useStyle();
  return (
    <FluentProvider theme={theme} className={mergeClasses(style.root)}>
      <PaperContext.Provider value={{ papers: [] }}>
        <Header className={mergeClasses(style.header)} />
        <main className={mergeClasses(style.main)}>
          <SideBar className={mergeClasses(style.sideBar)} />
          <Query className={mergeClasses(style.panels)} />
          <Library className={mergeClasses(style.central)} />
          <Panel className={mergeClasses(style.panels)} />
        </main>
        <Footer />
      </PaperContext.Provider>
    </FluentProvider>
  )
}

export default App
