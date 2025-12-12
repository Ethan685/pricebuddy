import { pipeline } from '@xenova/transformers';

// Singleton instance to avoid reloading model
let extractor: any = null;

export async function getEmbedding(text: string): Promise<number[]> {
    if (!extractor) {
        // 'feature-extraction' pipeline with a small, efficient model
        extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    }

    // Generate output. output.data is a Float32Array
    const output = await extractor(text, { pooling: 'mean', normalize: true });

    // Convert Float32Array to number[]
    return Array.from(output.data);
}
