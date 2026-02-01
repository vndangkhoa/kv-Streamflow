import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Watch from './pages/Watch';
import MyList from './pages/MyList';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/my-list" element={<MyList />} />
          <Route path="/watch/:slug/:episode" element={<Watch />} />
          <Route path="/watch/:slug" element={<Watch />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
