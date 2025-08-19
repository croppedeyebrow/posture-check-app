import { ThemeProvider } from "styled-components";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { theme } from "./styles/theme";
import GlobalStyle from "./styles/GlobalStyle";
import GoogleAnalytics from "./components/GoogleAnalytics";
import Header from "./components/layout/Header";
import LanguageSelector from "./components/common/LanguageSelector";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Home from "./pages/Home";
import PostureDetection from "./pages/PostureDetection";
import PostureData from "./pages/PostureData";
import Login from "./pages/Login";
import Register from "./pages/Register";
import "./i18n"; // i18n 초기화

function AppContent() {
  const location = useLocation();
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <>
      {!isAuthPage && <Header />}
      {!isAuthPage && <LanguageSelector />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/detection"
          element={
            <ProtectedRoute>
              <PostureDetection />
            </ProtectedRoute>
          }
        />
        <Route
          path="/data"
          element={
            <ProtectedRoute>
              <PostureData />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Router>
        <GoogleAnalytics />
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;
