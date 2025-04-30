import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RoomsList from "./RoomsList";
import RoomDetail from "./RoomDetail"; // (we will create it next)

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RoomsList />} />
        <Route path="/room/:roomId" element={<RoomDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
