import React from "react";

export default function App() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-2xl text-center">
        <div className="inline-flex items-center gap-3 justify-center mb-6">
          <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
            <span className="text-lg font-bold">M</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            MUSCLEPRO
          </h1>
        </div>

        <p className="text-white/75 text-lg leading-relaxed">
          Plataforma cargada correctamente.
          <br />
          El asistente de inteligencia artificial será habilitado en la siguiente
          fase desde backend seguro.
        </p>

        <div className="mt-8 grid gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-left">
            <div className="text-sm text-white/60">Estado</div>
            <div className="mt-1 font-semibold">
              ✅ Aplicación React funcionando sin errores
            </div>
            <div className="mt-2 text-sm text-white/60">
              IA desactivada temporalmente para evitar uso de API Key en el navegador.
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-left">
            <div className="text-sm text-white/60">Próximo paso</div>
            <div className="mt-1 font-semibold">
              Conectar IA vía backend (Vercel Serverless / API Route)
            </div>
            <div className="mt-2 text-sm text-white/60">
              La API Key debe vivir en variables de entorno del servidor, no en el frontend.
            </div>
          </div>
        </div>

        <div className="mt-8 text-xs text-white/50">
          MUSCLEPRO • High Performance • v0.1 (modo estable sin IA)
        </div>
      </div>
    </div>
  );
}
