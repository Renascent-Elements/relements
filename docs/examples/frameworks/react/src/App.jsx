import { useState } from "react";
import Tabs from "./Tabs.jsx";

export default function App() {
  const [mounted, setMounted] = useState(true);

  return (
    <main style={{ padding: "var(--re-space-8)", maxWidth: "48rem", margin: "0 auto" }}>
      <h1>React</h1>

      <p>
        <button className="re-button" type="button">
          Save
        </button>
      </p>

      <button id="toggle" type="button" onClick={() => setMounted((m) => !m)}>
        Toggle tabs
      </button>

      {mounted && <Tabs />}
    </main>
  );
}
