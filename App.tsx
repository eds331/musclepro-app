import React from "react";

function App() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#000000",
        color: "#ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        textAlign: "center",
        padding: "20px",
      }}
    >
      <h1 style={{ fontSize: "32px", fontWeight: "700" }}>
        MUSCLEPRO
      </h1>

      <p style={{ marginTop: "16px", color: "#9CA3AF", maxWidth: "420px" }}>
        Plataforma cargada correctamente.
        <br />
        El asistente de inteligencia artificial será habilitado
        en la siguiente fase desde backend seguro.
      </p>

      <div
        style={{
          marginTop: "32px",
          padding: "12px 20px",
          borderRadius: "8px",
          backgroundColor: "#111827",
          border: "1px solid #1F2937",
          color: "#22C55E",
          fontSize: "14px",
        }}
      >
        ✔ Aplicación React funcionando sin errores
      </div>
    </div>
  );
}

export default App;
