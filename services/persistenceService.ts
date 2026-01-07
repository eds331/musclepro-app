
import { User } from '../types';

/**
 * Persistencia en la Nube MUSCLEPRO
 * Este servicio maneja el guardado automático y la recuperación de datos.
 */

// NOTA PARA EL USUARIO: Para producción, aquí se conecta con Supabase o Firebase.
// Por ahora, simulamos la latencia de red y persistencia centralizada.
const MOCK_CLOUD_URL = 'https://api.musclepro.cl/v1/sync'; 

export const PersistenceService = {
  /**
   * Sube los datos del usuario automáticamente.
   */
  saveToCloud: async (user: User): Promise<boolean> => {
    console.log(`[Cloud] Sincronizando datos de ${user.email}...`);
    
    // Simulamos la llamada a la API
    return new Promise((resolve) => {
      setTimeout(() => {
        // En una app real: await fetch(MOCK_CLOUD_URL, { method: 'POST', body: JSON.stringify(user) });
        localStorage.setItem(`cloud_backup_${user.email}`, JSON.stringify(user));
        console.log(`[Cloud] ✅ Datos sincronizados correctamente.`);
        resolve(true);
      }, 800);
    });
  },

  /**
   * Descarga la última versión de los datos del usuario.
   */
  loadFromCloud: async (email: string): Promise<User | null> => {
    console.log(`[Cloud] Descargando perfil para ${email}...`);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = localStorage.getItem(`cloud_backup_${email}`);
        if (data) {
          console.log(`[Cloud] 📥 Perfil recuperado de la nube.`);
          resolve(JSON.parse(data));
        } else {
          console.log(`[Cloud] ℹ️ No se encontraron datos previos en la nube.`);
          resolve(null);
        }
      }, 1200);
    });
  }
};
