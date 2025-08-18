import { readFile, writeFile } from 'node:fs/promises'
import sharp from "sharp";
import { extractImages, extractText, getDocumentProxy, extractLinks, getMeta } from 'unpdf';

export async function main(filePath, dumpData = false) {
    if (!filePath) {
        throw new Error("File path is required");
    }
    const buffer = await readFile(filePath)
    const pdf = await getDocumentProxy(new Uint8Array(buffer))

    const pdfMetaData = await getPdfMeta(pdf).catch(console.error)
    const pdfTextData = await extractPdfText(pdf).catch(console.error)
    const pdfLinksData = await extractPdfLinks(pdf).catch(console.error)
    const pdfImagesData = await extractPdfImages(pdf).catch(console.error)

    const pdfData = {
        pdfMetaData,
        pdfTextData,
        pdfLinksData,
        pdfImagesData
    };
    // if (dumpData) writeFile("./dump/pdfData.json", JSON.stringify(pdfData, null, 2))
    return pdfData;
}

async function getPdfMeta(pdf) {
    const meta = await getMeta(pdf)
    return meta;
}

async function extractPdfText(pdf) {
    const { text, totalPages } = await extractText(pdf)
    return { text, totalPages: totalPages ?? text.length }
}

async function extractPdfLinks(pdf) {
    const links = await extractLinks(pdf)
    return links;
}

async function extractPdfImages(pdf) {
    const { totalPages } = await extractText(pdf, { mergePages: true })
    const imagePaths = [];
    for (let i = 1; i <= totalPages; i++) {
        const imagesData = await extractImages(pdf, i)
        let totalImagesProcessed = 0
        for (const imgData of imagesData) {
            const imageIndex = ++totalImagesProcessed
            await sharp(imgData.data, {
                raw: { width: imgData.width, height: imgData.height, channels: imgData.channels }
            })
                .png()
                .toFile(`./dump/images/${i}_${imageIndex}.png`)

            imagePaths.push(`./dump/images/${i}_${imageIndex}.png`);
        }
    }
    return imagePaths;
}