export async function isUrlBroken(url: string): Promise<boolean> {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return !response.ok; // Returns true if the response status is not OK (200-299)
    } catch (error) {
        return true; // If there's an error, the URL is considered broken
    }
}
