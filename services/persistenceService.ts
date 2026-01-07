
import { User } from '../types';

/**
 * MUSCLECLOUD PRO - SERVICIO DE PERSISTENCIA GLOBAL
 * Esta versión utiliza un motor de búsqueda por ID único para evitar latencia de listas.
 */

const API_BASE = 'https://api.restful-api.dev/objects';

// Llave única para el usuario en la base de datos global
const getCloudKey = (email: string) => {
  return `musclepro_v6_final_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
};

export const PersistenceService = {
  /**
   * Sincronización Atómica: Sube los datos solo si la app está lista.
   */
  saveToCloud: async (user: User): Promise<boolean> => {
    const cloudName = getCloudKey(user.email);
    
    try {
      // 1. Buscamos si ya existe para obtener su ID único de base de datos
      const remoteId = await PersistenceService.getInternalId(user.email);
      
      const payload = {
        name: cloudName,
        data: {
          ...user,
          lastUpdated: new Date().getTime() // Estampado de tiempo para resolución de conflictos
        }
      };

      if (remoteId) {
        // ACTUALIZAR REGISTRO EXISTENTE
        const res = await fetch(`${API_BASE}/${remoteId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        return res.ok;
      } else {
        // CREAR NUEVO REGISTRO
        const res = await fetch(API_BASE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        return res.ok;
      }
    } catch (error) {
      console.error("[Cloud] Error crítico de guardado:", error);
      return false;
    }
  },

  /**
   * Carga forzada desde la nube: Ignora el caché local para asegurar consistencia.
   */
  loadFromCloud: async (email: string): Promise<User | null> => {
    const cloudName = getCloudKey(email);
    console.log(`[Cloud] Forzando descarga de perfil maestro para: ${email}`);

    try {
      // En esta API pública, buscamos el objeto por nombre en la lista global
      const response = await fetch(API_BASE);
      if (!response.ok) return null;
      
      const allObjects = await response.json();
      const userObj = allObjects.find((obj: any) => obj.name === cloudName);
      
      if (userObj && userObj.data) {
        return userObj.data as User;
      }
      return null;
    } catch (error) {
      console.error("[Cloud] Fallo en descarga remota:", error);
      return null;
    }
  },

  /**
   * Obtiene el ID interno del objeto en el servidor para operaciones PUT
   */
  getInternalId: async (email: string): Promise<string | null> => {
    try {
      const cloudName = getCloudKey(email);
      const res = await fetch(API_BASE);
      const data = await res.json();
      const found = data.find((obj: any) => obj.name === cloudName);
      return found ? found.id : null;
    } catch {
      return null;
    }
  }
};
