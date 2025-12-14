
import React, { useState } from 'react';
import { Mail, ArrowRight, Lock, KeyRound, Dumbbell } from 'lucide-react';

interface LoginProps {
  onLogin: (email: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only 1 digit
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.includes('@')) {
      setError('Por favor ingresa un correo válido');
      return;
    }

    const fullCode = code.join('');
    if (fullCode.length !== 4) {
        setError('Ingresa los 4 dígitos de tu código de acceso');
        return;
    }
    
    setLoading(true);
    setError('');

    // Simulate Credential Validation
    setTimeout(() => {
      const normalizedEmail = email.toLowerCase().trim();
      let isValid = false;

      // Specific Rule: Ed Sanhueza must use 1111
      if (normalizedEmail === 'ed.sanhuezag@gmail.com') {
          if (fullCode === '1111') {
              isValid = true;
          }
      } 
      // General Rule: Other emails can use 1234 for demo purposes
      else if (fullCode === '1234') {
          isValid = true;
      }

      if (isValid) {
        onLogin(normalizedEmail);
      } else {
        setLoading(false);
        setError('Credenciales incorrectas. Verifica tu código.');
        setCode(['', '', '', '']);
        document.getElementById('otp-0')?.focus();
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-500/10 blur-[100px] rounded-full"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[100px] rounded-full"></div>
      </div>

      <div className="w-full max-w-md bg-dark-900 border border-dark-800 rounded-3xl p-8 relative z-10 shadow-2xl animate-fade-in">
          {/* Brand CSS Logo */}
          <div className="flex flex-col items-center mb-8">
               <div className="relative mb-3">
                   <div className="absolute inset-0 bg-brand-500 blur-xl opacity-30 rounded-full"></div>
                   <Dumbbell size={48} className="text-white relative z-10 transform -rotate-12" />
               </div>
               <h1 className="text-4xl font-black text-white italic tracking-tighter">
                   MUSCLE<span className="text-brand-500">PRO</span>
               </h1>
               <p className="text-[10px] tracking-[0.4em] text-dark-500 mt-2 uppercase font-bold">Portal de Atletas</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
              
              {/* Email Input */}
              <div className="space-y-2">
                  <label className="block text-xs font-bold text-dark-500 uppercase tracking-wider">Correo Electrónico</label>
                  <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" size={20} />
                      <input 
                          type="email" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="ejemplo@musclepro.com"
                          className="w-full bg-dark-950 border border-dark-700 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-dark-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50 transition-all"
                          required
                      />
                  </div>
              </div>

              {/* Access Code Input */}
              <div className="space-y-2">
                  <div className="flex justify-between items-end">
                      <label className="block text-xs font-bold text-dark-500 uppercase tracking-wider">Código de Acceso</label>
                  </div>
                  <div className="flex justify-between gap-2">
                      {code.map((digit, index) => (
                          <input
                              key={index}
                              id={`otp-${index}`}
                              type="text"
                              maxLength={1}
                              inputMode="numeric"
                              value={digit}
                              onChange={(e) => handleCodeChange(index, e.target.value)}
                              placeholder="•"
                              className="w-full h-14 bg-dark-950 border border-dark-700 rounded-xl text-center text-2xl font-bold text-white placeholder-dark-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/50 transition-all"
                          />
                      ))}
                  </div>
                  {/* Updated helper text to be less explicit but helpful for dev context */}
                  <p className="text-[10px] text-dark-600 text-right italic">Ingresa el código entregado por administración.</p>
              </div>

              {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                      <p className="text-red-400 text-xs font-bold">{error}</p>
                  </div>
              )}

              <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-4 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                  {loading ? (
                      <span className="animate-pulse">Validando Credenciales...</span>
                  ) : (
                      <>INGRESAR AL SISTEMA <ArrowRight size={18}/></>
                  )}
              </button>
          </form>

          <div className="mt-8 pt-6 border-t border-dark-800 text-center">
              <p className="text-[10px] text-dark-600 uppercase tracking-widest">
                  Centro de Alto Rendimiento
              </p>
          </div>
      </div>
    </div>
  );
};
