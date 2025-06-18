import { ThemeProvider } from "styled-components";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { theme } from "./styles/theme";
import GlobalStyle from "./styles/GlobalStyle";
import Home from "./pages/Home";
import PostureDetection from "./pages/PostureDetection";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/detection" element={<PostureDetection />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
