import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import "./App.css";

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route
            path="/"
            element={
              <div className="flex items-center justify-center h-[100vh]">
                <div className="text-center">
                  <h1 className="text-6xl text-amber-500 font-serif mb-4">
                    Welcome Prompt Masters
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    Status:{" "}
                    {isAuthenticated ? "Authenticated" : "Not Authenticated"}
                  </p>
                </div>
              </div>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
