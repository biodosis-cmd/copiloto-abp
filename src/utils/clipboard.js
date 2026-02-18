/**
 * Copies text to the clipboard.
 * Uses navigator.clipboard API if available (secure contexts).
 * Falls back to document.execCommand('copy') for insecure contexts (HTTP).
 */
export async function copyToClipboard(text) {
    if (!navigator.clipboard) {
        // Fallback for insecure contexts
        try {
            const textArea = document.createElement("textarea");
            textArea.value = text;

            // Ensure textarea is not visible but part of DOM
            textArea.style.position = "fixed";
            textArea.style.left = "-9999px";
            textArea.style.top = "0";
            document.body.appendChild(textArea);

            textArea.focus();
            textArea.select();

            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);

            if (successful) {
                return true;
            } else {
                throw new Error('Fallback copy failed');
            }
        } catch (err) {
            console.error('Fallback copy failed', err);
            return false;
        }
    }

    // Modern API
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Clipboard API failed', err);
        return false;
    }
}
