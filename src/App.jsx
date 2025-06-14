// src/App.jsx
import React from "react";
import Routes from "./Routes";
import SupabaseProvider from './context/SupabaseProvider';

function App() {
  return (
    <SupabaseProvider>
      <Routes />
    </SupabaseProvider>
  );
}

export default App;