function getConfig(name: string, defaultValue = null): string {
    const prefix = "VITE_"
    console.log(import.meta.env[prefix + name]) 
    return import.meta.env[prefix + name] ?? defaultValue;
}

export function getBackendUrl(): string {
    return getConfig('BACKEND_URL');
}

export function getHoursCloseTicketsAuto() {
    return getConfig('HOURS_CLOSE_TICKETS_AUTO');
}

interface ImportMetaEnv {
    readonly VITE_TOKEN: string;
    readonly VITE_HOURS_CLOSE_TICKETS_AUTO: number;
  }
  
interface ImportMeta {
    readonly env: ImportMetaEnv;
}