import React from "react";

/**
 * App principal MUSCLEPRO
 * IA desactivada temporalmente para evitar crash en navegador
 * (la IA se debe ejecutar solo vía backend / API)
 */

export default function App() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold tracking-wide">
        MUSCLEPRO
      </h1>

      <p className="text-gray-400 mt-4 text-center max-w-md">
        Plataforma en línea correctamente.<br />
        El asistente IA será habilitado vía backend en la siguiente fase.
      </p>

      <div className="mt-8 px-6 py-3 rounded-lg bg-zinc-900 border border-zinc-800">
        <span className="text-sm text-green-400">
          ✔ App cargada sin errores
        </span>
      </div>
    </div>
  );
}
