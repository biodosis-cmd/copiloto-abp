/**
 * Generates a UUID v4 string.
 * Uses crypto.randomUUID() if available (secure contexts),
 * otherwise falls back to a math.random implementation.
 * This is crucial for mobile testing on local network (http://192.168.x.x)
 * where crypto.randomUUID is often undefined due to lack of HTTPS.
 */
export function generateUUID() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }

    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
