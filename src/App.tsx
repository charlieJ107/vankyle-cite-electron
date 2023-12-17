import { useState } from 'react'
import Footer from './components/footer';
import { BrandVariants, FluentProvider, Theme, createDarkTheme, createLightTheme, makeStyles, mergeClasses, tokens } from '@fluentui/react-components';
import Header from './components/header';
import SideBar from './components/sidebar';
import Home from './components/home';
import Panel from './components/panel';

const vankyleCiteBlue: BrandVariants = {
  10: "#020305",
  20: "#111723",
  30: "#16263D",
  40: "#193253",
  50: "#1B3F6A",
  60: "#1B4C82",
  70: "#18599B",
  80: "#1267B4",
  90: "#3174C2",
  100: "#4F82C8",
  110: "#6790CF",
  120: "#7D9ED5",
  130: "#92ACDC",
  140: "#A6BAE2",
  150: "#BAC9E9",
  160: "#CDD8EF"
};

const lightTheme: Theme = {
  ...createLightTheme(vankyleCiteBlue),
};

const darkTheme: Theme = {
  ...createDarkTheme(vankyleCiteBlue),
};


darkTheme.colorBrandForeground1 = vankyleCiteBlue[110];
darkTheme.colorBrandForeground2 = vankyleCiteBlue[120];

const useStyle = makeStyles({
  root: {
    display: 'flex',
    height: '100vh',
    flexDirection: 'column'
  },
  header: {
    backgroundColor: tokens.colorBrandBackground
  },
  main: {
    backgroundColor: tokens.colorNeutralBackground2
  },
  sidebar:{
    backgroundColor: tokens.colorBrandBackground2
  }
  
})

function App() {
  const [theme, setTheme] = useState<Theme>(lightTheme);
  const style = useStyle();
  return (
    <FluentProvider theme={theme} className={mergeClasses(style.root)}>
      <Header className={mergeClasses(style.header)} />
      <main className={mergeClasses(style.main, "flex ")}>
        <SideBar className={mergeClasses(style.sidebar)} />
        <Home />
        <Panel />
      </main>
      <Footer />
    </FluentProvider>
  )
}

export default App
