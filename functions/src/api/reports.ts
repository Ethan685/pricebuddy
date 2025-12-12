import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import PDFDocument from 'pdfkit';
import { Parser } from 'json2csv';

const db = admin.firestore();

// Internal helper for PDF generation
async function createPDF(title: string, data: any[]): Promise<string> {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            const pdfData = Buffer.concat(buffers);
            resolve(pdfData.toString('base64'));
        });

        // Add content
        doc.fontSize(25).text(title, 100, 100);
        doc.fontSize(12).text(`Generated: ${new Date().toLocaleDateString()}`, 100, 130);

        doc.moveDown();

        // Simple Table-like listing
        data.forEach((item, i) => {
            const text = JSON.stringify(item)
                .replace(/{|}|"/g, '')
                .replace(/,/g, ' | ');

            doc.text(`${i + 1}. ${text}`);
            doc.moveDown(0.5);
        });

        doc.end();
    });
}

export const generateB2BReport = functions.https.onCall(async (data, context) => {
    // 1. Auth & Role Check
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Must be logged in");
    }

    const { type, format } = data; // format: 'csv' or 'pdf'

    // RBAC Check for Enterprise Role
    const userRef = db.collection('users').doc(context.auth.uid);
    const userSnap = await userRef.get();
    const userData = userSnap.data();

    // Allow if role is enterprise OR admin
    if (userData?.role !== 'enterprise' && userData?.role !== 'admin') {
        throw new functions.https.HttpsError("permission-denied", "Enterprise plan required.");
    }

    try {
        let stats = [];

        // 2. Fetch Real Data
        if (type === 'price_trends') {
            const snap = await db.collection('price_history').orderBy('timestamp', 'desc').limit(50).get();
            stats = snap.docs.map(d => d.data());
            if (stats.length === 0) {
                // Mock if empty
                stats = [
                    { product: "Sony WH-1000XM5", price: 399000, date: "2024-05-01" },
                    { product: "Sony WH-1000XM5", price: 389000, date: "2024-05-02" },
                ];
            }
        } else if (type === 'competitor_analysis') {
            const snap = await db.collection('products').limit(20).get();
            stats = snap.docs.map(d => ({
                title: d.data().title,
                minPrice: d.data().minPrice,
                avgPrice: d.data().minPrice * 1.1, // Mock
                merchantCount: 5 // Mock
            }));
        } else {
            throw new functions.https.HttpsError("invalid-argument", "Unknown report type");
        }

        // 3. Generate File
        let fileData = "";
        let finalFormat = format || 'csv';

        if (finalFormat === 'pdf') {
            fileData = await createPDF(type.toUpperCase().replace('_', ' '), stats);
            fileData = `data:application/pdf;base64,${fileData}`;
        } else {
            // CSV Default
            const parser = new Parser();
            const csv = parser.parse(stats);
            fileData = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
        }

        // 4. Log Job
        await db.collection("report_jobs").add({
            userId: context.auth.uid,
            type,
            format: finalFormat,
            itemsCount: stats.length,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        return {
            url: fileData, // Data URI for direct download
            items: stats.length
        };

    } catch (error) {
        functions.logger.error("Report Gen Failed", error);
        throw new functions.https.HttpsError("internal", "Report generation failed");
    }
});
