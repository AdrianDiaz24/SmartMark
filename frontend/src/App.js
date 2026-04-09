import React from 'react';
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import "./App.css";

function App() {
  return (
    <div className="App">
      <Header />
      <main className={"app-layout"}>
          <Sidebar/>
      </main>
    </div>
  );
}

export default App;