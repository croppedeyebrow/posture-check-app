import { ThemeProvider } from "styled-components";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { theme } from "./styles/theme";
import GlobalStyle from "./styles/GlobalStyle";
import GoogleAnalytics from "./components/GoogleAnalytics";
import Header from "./components/layout/Header";
import LanguageSelector from "./components/common/LanguageSelector";
import Home from "./pages/Home";
import PostureDetection from "./pages/PostureDetection";
import PostureData from "./pages/PostureData";
import "./i18n"; // i18n 초기화

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Router>
        <GoogleAnalytics />
        <Header />
        <LanguageSelector />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/detection" element={<PostureDetection />} />
          <Route path="/data" element={<PostureData />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
