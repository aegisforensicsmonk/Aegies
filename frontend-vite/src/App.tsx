import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import RansomwareLab from './pages/RansomwareLab';

// ... other imports ...

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white font-sans">
        <nav className="bg-gray-800 p-4 shadow-lg border-b border-gray-700 flex space-x-6">
          <Link to="/" className="font-bold text-blue-400 hover:text-blue-300 transition-colors">CIIP Home</Link>
          <Link to="/ransomware-lab" className="text-gray-300 hover:text-white transition-colors">Ransomware Lab</Link>
        </nav>
        <main className="p-4">
          <Routes>
            <Route path="/ransomware-lab" element={<RansomwareLab />} />
            <Route path="/" element={<div className="p-8">Welcome to CIIP</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
