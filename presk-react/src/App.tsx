import { PreskPlayer } from "./presk/index";
import PreskLogo from "./presk/PreskLogo";
import EXAMPLE from "./history.presk.json";

function App() {
  return (
    <div className="app-container" style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", gap: "20px" }}>
      <header style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", paddingTop: "8px" }}>
        <PreskLogo size={100} animated={true} />
        <h1 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 600, color: "#f8fafc", letterSpacing: "0.04em" }}>
          Presk Animation Player
        </h1>
      </header>
      <main style={{ width: "100%", display: "flex", justifyContent: "center" }}>
        <PreskPlayer preskDocument={EXAMPLE} />
      </main>
    </div>
  );
}

export default App;
