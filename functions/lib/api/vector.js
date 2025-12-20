"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryIndex = exports.addToIndex = exports.generateEmbedding = exports.initSchema = void 0;
const weaviate_ts_client_1 = __importDefault(require("weaviate-ts-client"));
const openai_1 = __importDefault(require("openai"));
// Initialize OpenAI
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY || 'sk-dummy-key-for-dev', // Fallback for building without failing
});
// Initialize Weaviate
// For local dev with docker-compose, usually http://localhost:8080
const weaviateClient = weaviate_ts_client_1.default.client({
    scheme: 'http',
    host: process.env.WEAVIATE_HOST || 'localhost:8080',
    // apiKey: new ApiKey('kb-api-key'), // Only if auth enabled
});
// Schema definition (run once or check on startup)
const initSchema = async () => {
    const classObj = {
        class: 'Product',
        vectorizer: 'none', // We provide vectors manually from OpenAI
        properties: [
            { name: 'title', dataType: ['text'] },
            { name: 'productId', dataType: ['string'] },
            { name: 'source', dataType: ['string'] }, // Amazon, Coupang, etc.
            { name: 'price', dataType: ['number'] },
            { name: 'currency', dataType: ['string'] },
            { name: 'url', dataType: ['string'] },
        ],
    };
    try {
        const schema = await weaviateClient.schema.getter().do();
        const exists = schema.classes?.some((c) => c.class === 'Product');
        if (!exists) {
            await weaviateClient.schema.classCreator().withClass(classObj).do();
            console.log('Weaviate Schema "Product" created.');
        }
    }
    catch (e) {
        console.warn('Weaviate schema check failed (service might be down):', e);
    }
};
exports.initSchema = initSchema;
// Generate Embedding
const generateEmbedding = async (text) => {
    // Check if key is dummy
    if (openai.apiKey === 'sk-dummy-key-for-dev') {
        console.warn('Using DUMMY embedding (random vector) because OPENAI_API_KEY is not set.');
        return Array.from({ length: 1536 }, () => Math.random());
    }
    try {
        const response = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: text,
            encoding_format: 'float',
        });
        return response.data[0].embedding;
    }
    catch (e) {
        console.error('OpenAI embedding failed:', e);
        throw new Error('Embedding generation failed');
    }
};
exports.generateEmbedding = generateEmbedding;
// Add/Update Search Index
const addToIndex = async (product) => {
    const vector = await (0, exports.generateEmbedding)(product.title);
    await weaviateClient.data
        .creator()
        .withClassName('Product')
        .withProperties({
        title: product.title,
        productId: product.productId || 'unknown',
        source: product.source || 'Manual',
        price: product.price || 0,
        currency: product.currency || 'KRW',
        url: product.url || '',
    })
        .withVector(vector)
        .do();
    console.log(`Indexed product: ${product.title}`);
};
exports.addToIndex = addToIndex;
/**
 * Find similar products
 * @param queryText Product title to match
 * @param limit Number of matches
 */
const queryIndex = async (queryText, limit = 5) => {
    const vector = await (0, exports.generateEmbedding)(queryText);
    try {
        const res = await weaviateClient.graphql
            .get()
            .withClassName('Product')
            .withFields('title price currency source url _additional { distance }')
            .withNearVector({ vector: vector })
            .withLimit(limit)
            .do();
        // Standardize output
        const matches = res.data.Get.Product.map((p) => ({
            title: p.title,
            price: p.price,
            currency: p.currency,
            source: p.source,
            url: p.url,
            similarityScore: p._additional ? 1 - p._additional.distance : 0, // Weaviate returns distance (0=same)
        }));
        return matches;
    }
    catch (e) {
        console.error('Vector search failed:', e);
        // Fallback for demo if DB is down
        return [];
    }
};
exports.queryIndex = queryIndex;
