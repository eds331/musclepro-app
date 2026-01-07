
import { User } from '../types';

/**
 * SERVICIO DE NUBE REAL MUSCLEPRO
 * Utiliza una API REST pública para persistencia persistente entre dispositivos.
 */

const API_BASE = 'https://api.restful-api.dev/objects';

// Generamos un ID determinista para el objeto en la nube basado en el email
const getCloudId = (email: string) => {
  return `mp_elite_v5_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
};

export const PersistenceService = {
  /**
   * Guarda o actualiza los datos del usuario en el servidor global.
   */
  saveToCloud: async (user: User): Promise<boolean> => {
    const cloudKey = getCloudId(user.email);
    console.log(`[Cloud] Sincronizando datos globales para ${user.email}...`);

    try {
      // 1. Intentamos buscar si ya existe para obtener el ID interno del servidor
      const existing = await PersistenceService.getRemoteId(user.email);
      
      const payload = {
        name: cloudKey,
        data: user
      };

      if (existing) {
        // ACTUALIZAR (PUT)
        await fetch(`${API_BASE}/${existing}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        // CREAR NUEVO (POST)
        await fetch(API_BASE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      
      console.log(`[Cloud] ✅ Sincronización global exitosa.`);
      return true;
    } catch (error) {
      console.error(`[Cloud] ❌ Error de red:`, error);
      return false;
    }
  },

  /**
   * Recupera los datos desde cualquier dispositivo usando el email.
   */
  loadFromCloud: async (email: string): Promise<User | null> => {
    const cloudKey = getCloudId(email);
    console.log(`[Cloud] Buscando datos en servidor global para ${email}...`);

    try {
      const response = await fetch(API_BASE);
      const allObjects = await response.json();
      
      // Buscamos nuestro objeto por nombre
      const userObject = allObjects.find((obj: any) => obj.name === cloudKey);
      
      if (userObject && userObject.data) {
        console.log(`[Cloud] 📥 Datos recuperados del servidor global.`);
        return userObject.data as User;
      }
      return null;
    } catch (error) {
      console.error(`[Cloud] ❌ Error al descargar datos:`, error);
      return null;
    }
  },

  /**
   * Función interna para encontrar el ID técnico del objeto en el servidor
   */
  getRemoteId: async (email: string): Promise<string | null> => {
    try {
      const cloudKey = getCloudId(email);
      const response = await fetch(API_BASE);
      const allObjects = await response.json();
      const found = allObjects.find((obj: any) => obj.name === cloudKey);
      return found ? found.id : null;
    } catch {
      return null;
    }
  }
};
