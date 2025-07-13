import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import SinglePrediction from './pages/SinglePrediction';
import BulkUpload from './pages/BulkUpload';
import DataVisualization from './pages/DataVisualization';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="single-prediction" element={<SinglePrediction />} />
            <Route path="bulk-upload" element={<BulkUpload />} />
            <Route path="data-visualization" element={<DataVisualization />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;