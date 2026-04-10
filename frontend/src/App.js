import React from 'react';
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import "./App.css";
import MainContent from "./components/MainContent";

function App() {
  return (
    <div className="App">
      <Header />
      <main className={"app-layout"}>
          <Sidebar/>
          <MainContent/>
      </main>
    </div>
  );
}

export default App;