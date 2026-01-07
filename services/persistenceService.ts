
import { User } from '../types';

/**
 * MUSCLEPRO CLOUD ENGINE v8 - PRODUCTION GRADE
 * Sistema de sincronización con direccionamiento directo y resolución de conflictos.
 */

const API_BASE = 'https://api.restful-api.dev/objects';
const CLOUD_ID_KEY = 'musclepro_v8_cloud_id';

export const PersistenceService = {
  /**
   * Genera un nombre único basado en el email para descubrimiento inicial.
   */
  getUniqueName: (email: string) => {
    return `MP_PRO_V8_${email.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
  },

  /**
   * Sincroniza el estado local con la nube.
   * Resuelve quién tiene la versión más reciente.
   */
  sync: async (localUser: User): Promise<User> => {
    try {
      const cloudId = localStorage.getItem(`${CLOUD_ID_KEY}_${localUser.email}`);
      const uniqueName = PersistenceService.getUniqueName(localUser.email);

      // 1. Intentar obtener datos de la nube
      let remoteData: any = null;
      
      if (cloudId) {
        const res = await fetch(`${API_BASE}/${cloudId}`);
        if (res.ok) {
          const json = await res.json();
          remoteData = json.data;
        } else {
          // Si el ID guardado ya no existe, lo borramos para re-descubrir
          localStorage.removeItem(`${CLOUD_ID_KEY}_${localUser.email}`);
        }
      }

      // 2. Si no tenemos ID, intentamos descubrir por nombre (para nuevos dispositivos)
      if (!remoteData) {
        const listRes = await fetch(API_BASE);
        const all = await listRes.json();
        const found = all.find((obj: any) => obj.name === uniqueName);
        if (found) {
          remoteData = found.data;
          localStorage.setItem(`${CLOUD_ID_KEY}_${localUser.email}`, found.id);
        }
      }

      // 3. Resolución de conflictos por timestamp
      // Si la nube es más nueva que lo local, la nube gana.
      if (remoteData && remoteData.lastUpdated > (localUser.currentXP || 0)) { 
        // Nota: Usamos una propiedad que cambie siempre o un timestamp dedicado
        if (remoteData.syncTimestamp > (localUser as any).syncTimestamp || 0) {
            console.log("[Cloud] ☁️ Nube es más reciente. Actualizando local...");
            return remoteData as User;
        }
      }

      // 4. Si lo local es más nuevo o igual, actualizamos la nube
      console.log("[Cloud] ⬆️ Local es maestro. Actualizando nube...");
      await PersistenceService.save(localUser);
      return localUser;

    } catch (error) {
      console.error("[Cloud] Error en ciclo de sincronización:", error);
      return localUser;
    }
  },

  /**
   * Guarda de forma atómica en la nube.
   */
  save: async (user: User): Promise<void> => {
    try {
      const cloudId = localStorage.getItem(`${CLOUD_ID_KEY}_${user.email}`);
      const uniqueName = PersistenceService.getUniqueName(user.email);
      
      // Añadimos metadata de sincronización
      const payload = {
        name: uniqueName,
        data: {
          ...user,
          syncTimestamp: Date.now(),
          lastUpdated: Date.now()
        }
      };

      if (cloudId) {
        await fetch(`${API_BASE}/${cloudId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        const res = await fetch(API_BASE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const result = await res.json();
        if (result.id) {
          localStorage.setItem(`${CLOUD_ID_KEY}_${user.email}`, result.id);
        }
      }
    } catch (error) {
      console.error("[Cloud] Error al guardar:", error);
    }
  }
};
