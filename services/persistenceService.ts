
import { User } from '../types';

/**
 * MUSCLEPRO CLOUD ENGINE v7
 * Utiliza un sistema de vinculación directa por ID para garantizar sincronización instantánea.
 */

const API_BASE = 'https://api.restful-api.dev/objects';
const ID_LINK_KEY = 'mp_cloud_object_id_v7';

export const PersistenceService = {
  /**
   * Obtiene el ID único de la base de datos vinculado a este usuario.
   * Si no existe localmente, intenta recuperarlo del servidor por el nombre (email).
   */
  getOrLinkedId: async (email: string): Promise<string | null> => {
    // 1. Ver en caché local del dispositivo
    const cachedId = localStorage.getItem(`${ID_LINK_KEY}_${email}`);
    if (cachedId) return cachedId;

    // 2. Si no está en caché (dispositivo nuevo), buscar en el servidor
    try {
      const response = await fetch(API_BASE);
      const allObjects = await response.json();
      const cloudName = `musclepro_user_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
      const found = allObjects.find((obj: any) => obj.name === cloudName);
      
      if (found) {
        localStorage.setItem(`${ID_LINK_KEY}_${email}`, found.id);
        return found.id;
      }
    } catch (e) {
      console.error("Error buscando ID vinculado:", e);
    }
    return null;
  },

  /**
   * Guarda los datos asegurando que no se pierda la conexión al objeto maestro.
   */
  saveToCloud: async (user: User): Promise<boolean> => {
    try {
      const remoteId = await PersistenceService.getOrLinkedId(user.email);
      const cloudName = `musclepro_user_${user.email.replace(/[^a-zA-Z0-9]/g, '_')}`;
      
      const payload = {
        name: cloudName,
        data: {
          ...user,
          syncTimestamp: Date.now() // Sello de tiempo para control de versiones
        }
      };

      if (remoteId) {
        // ACTUALIZACIÓN DIRECTA (MUCHO MÁS RÁPIDA)
        const res = await fetch(`${API_BASE}/${remoteId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        return res.ok;
      } else {
        // CREACIÓN INICIAL
        const res = await fetch(API_BASE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const result = await res.json();
        if (result.id) {
          localStorage.setItem(`${ID_LINK_KEY}_${user.email}`, result.id);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Fallo crítico en MuscleSync:", error);
      return false;
    }
  },

  /**
   * Carga forzada: se asegura de traer la versión más fresca del servidor.
   */
  loadFromCloud: async (email: string): Promise<User | null> => {
    try {
      const remoteId = await PersistenceService.getOrLinkedId(email);
      if (!remoteId) return null;

      const response = await fetch(`${API_BASE}/${remoteId}`);
      if (!response.ok) {
        // Si el ID ya no existe en el servidor, limpiar caché y re-intentar
        localStorage.removeItem(`${ID_LINK_KEY}_${email}`);
        return null;
      }
      
      const result = await response.json();
      return result.data as User;
    } catch (error) {
      console.error("Error descargando perfil maestro:", error);
      return null;
    }
  }
};
