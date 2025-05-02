import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import { GraphView } from './pages/GraphView';
import { TopNav } from './components/TopNav';

function App() {
  return (
    <>
      <TopNav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/graph" element={<GraphView />} />
      </Routes>
    </>
  );
}

export default App;
