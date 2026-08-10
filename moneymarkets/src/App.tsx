import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Course from "./pages/Course";

function App() {
  return (
    <div className="min-h-screen bg-void text-white overflow-x-hidden selection:bg-gold/30 selection:text-white">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/course" element={<Course />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
