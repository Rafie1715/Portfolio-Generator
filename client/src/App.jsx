import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PublicPortfolio from './pages/PublicPortfolio'; // Kita akan buat file ini
import CVView from './pages/CVView';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Rute dinamis untuk portofolio publik */}
        <Route path="/preview/:username" element={<PublicPortfolio isPreview />} />
        <Route path="/p/:username" element={<PublicPortfolio />} />
        <Route path="/cv/:username" element={<CVView />} />
      </Routes>
    </Router>
  );
}

export default App;
