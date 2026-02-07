import Dexie from 'dexie';

export const db = new Dexie('CopilotoDB');

db.version(1).stores({
    projects: '++id, nombre_proyecto, timestamp', // Primary key and indexed props
    settings: 'key' // Key-value store for preferences
});
