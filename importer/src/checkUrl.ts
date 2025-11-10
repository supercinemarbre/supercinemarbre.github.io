export async function isUrlBroken(url: string): Promise<boolean> {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return !response.ok; // Returns true if the response status is not OK (200-299)
    } catch (error) {
        return true; // If there's an error, the URL is considered broken
    }
}

// // Example usage
// isUrlBroken('https://m.media-amazon.com/images/M/MV5BMmNlYzRiNDctZWNhMi00MzI4LThkZTctMTUzMmZkMmFmNThmXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg').then(isBroken => {
//     console.log(`URL is broken: ${isBroken}`);
// });