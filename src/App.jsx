import { supabase } from "./supabaseClient";

function App() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        fontFamily: "Arial, sans-serif",
        textAlign: "center",
        padding: "20px",
      }}
    >
      <h1>Shindara Phoneflair</h1>
      <p>React is working.</p>
      <p>
        Supabase client test:{" "}
        {supabase === null ? "PASSED ✅" : "FAILED ❌"}
      </p>
    </div>
  );
}

export default App;
