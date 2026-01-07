
import { User } from '../types';

/**
 * MUSCLEPRO INFRASTRUCTURE ENGINE v10.1
 * Soporte optimizado para iHosting.cl y depuración de errores.
 */

const DB_CONFIG_KEY = 'mp_database_config';
const CLOUD_ID_KEY = 'musclepro_v10_cloud_id';
const API_SANDBOX = 'https://api.restful-api.dev/objects';

export interface DBConfig {
  url: string;
  key?: string;
  type: 'SUPABASE' | 'SANDBOX' | 'IHOSTING';
}

export const PersistenceService = {
  getConfig: (): DBConfig => {
    const saved = localStorage.getItem(DB_CONFIG_KEY);
    if (saved) return JSON.parse(saved);
    return { url: '', type: 'SANDBOX' };
  },

  setConfig: (config: DBConfig) => {
    localStorage.setItem(DB_CONFIG_KEY, JSON.stringify(config));
  },

  sync: async (localUser: User): Promise<User> => {
    const config = PersistenceService.getConfig();
    
    try {
      if (config.type === 'IHOSTING' && config.url) {
        return await PersistenceService.syncIHosting(localUser, config);
      }
      
      if (config.type === 'SUPABASE' && config.url && config.key) {
        return await PersistenceService.syncSupabase(localUser, config);
      }

      return await PersistenceService.syncSandbox(localUser);
    } catch (e) {
      console.error("Critical Sync Error:", e);
      return localUser;
    }
  },

  /**
   * Lógica para iHosting.cl (PHP Bridge)
   */
  syncIHosting: async (user: User, config: DBConfig): Promise<User> => {
    try {
      // 1. Intentar descargar datos remotos
      const res = await fetch(`${config.url}?email=${user.email}`, {
        cache: 'no-store'
      });
      
      if (!res.ok) throw new Error(`HTTP ${res.status}: Error de servidor`);
      
      const data = await res.json();
      
      // Si el servidor tiene datos más nuevos, los usamos
      if (data && data.profile_data) {
        const remoteUser = typeof data.profile_data === 'string' ? JSON.parse(data.profile_data) : data.profile_data;
        const remoteTS = remoteUser.syncTimestamp || 0;
        const localTS = (user as any).syncTimestamp || 0;

        if (remoteTS > localTS) {
          console.log("[iHosting] 🌐 Datos remotos más nuevos. Actualizando local.");
          return remoteUser;
        }
      }

      // Si nuestros datos son más nuevos o el servidor no tiene nada, guardamos lo local
      await PersistenceService.saveIHosting(user, config);
      return user;
    } catch (e) {
      console.error("[iHosting] Sync Failed:", e);
      throw e; // Propagar para que la UI sepa que hubo error
    }
  },

  saveIHosting: async (user: User, config: DBConfig) => {
    const payload = {
      email: user.email,
      profile_data: { ...user, syncTimestamp: Date.now() }
    };

    const res = await fetch(config.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Error al guardar: ${errorText}`);
    }
    
    console.log("[iHosting] ✅ Datos guardados con éxito en musclepro.cl");
    return true;
  },

  /**
   * Lógica de Supabase (Postgres)
   */
  syncSupabase: async (user: User, config: DBConfig): Promise<User> => {
    try {
      const tableUrl = `${config.url}/rest/v1/athletes?email=eq.${user.email}`;
      const headers = {
        'apikey': config.key || '',
        'Authorization': `Bearer ${config.key}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      };

      const res = await fetch(tableUrl, { headers });
      const data = await res.json();

      if (data && data.length > 0) {
        const remoteUser = data[0].profile_data;
        if (remoteUser.syncTimestamp > (user as any).syncTimestamp || 0) {
          return remoteUser;
        }
      }

      await PersistenceService.saveSupabase(user, config);
      return user;
    } catch (e) {
      return user;
    }
  },

  saveSupabase: async (user: User, config: DBConfig) => {
    const tableUrl = `${config.url}/rest/v1/athletes`;
    await fetch(tableUrl, {
      method: 'POST',
      headers: {
        'apikey': config.key || '',
        'Authorization': `Bearer ${config.key}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        email: user.email,
        profile_data: { ...user, syncTimestamp: Date.now() },
        updated_at: new Date().toISOString()
      })
    });
  },

  syncSandbox: async (localUser: User): Promise<User> => {
    try {
      const cloudId = localStorage.getItem(`${CLOUD_ID_KEY}_${localUser.email}`);
      const uniqueName = `MP_V10_ATLETA_${localUser.email.replace(/[^a-zA-Z0-9]/g, '_')}`;

      let remote: any = null;
      if (cloudId) {
        const res = await fetch(`${API_SANDBOX}/${cloudId}`);
        if (res.ok) remote = (await res.json()).data;
      }

      if (!remote) {
        const list = await (await fetch(API_SANDBOX)).json();
        const found = list.find((o: any) => o.name === uniqueName);
        if (found) {
          remote = found.data;
          localStorage.setItem(`${CLOUD_ID_KEY}_${localUser.email}`, found.id);
        }
      }

      if (remote && (remote.syncTimestamp > (localUser as any).syncTimestamp || 0)) {
        return remote;
      }

      await PersistenceService.saveSandbox(localUser);
      return localUser;
    } catch {
      return localUser;
    }
  },

  saveSandbox: async (user: User) => {
    const cloudId = localStorage.getItem(`${CLOUD_ID_KEY}_${user.email}`);
    const payload = {
      name: `MP_V10_ATLETA_${user.email.replace(/[^a-zA-Z0-9]/g, '_')}`,
      data: { ...user, syncTimestamp: Date.now() }
    };

    if (cloudId) {
      await fetch(`${API_SANDBOX}/${cloudId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      const res = await fetch(API_SANDBOX, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.id) localStorage.setItem(`${CLOUD_ID_KEY}_${user.email}`, data.id);
    }
  }
};
