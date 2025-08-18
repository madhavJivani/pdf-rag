import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { main as PDFLoader } from './pdfLoader.js'
import { splitText } from "./utils.js";

import "dotenv/config"
import fs from "fs";
import { finalResponse } from "./multiModal.chat.js";

async function configureVectorStore(userId) {
    const embeddings = new OpenAIEmbeddings({
        model: "text-embedding-3-small",
    });

    // This will create the collection if it doesn't exist, or use existing one
    // Note: Collection names cannot contain ':' in Qdrant
    const vectorStore = new QdrantVectorStore(embeddings, {
        url: process.env.QDRANT_URL,
        collectionName: `user_${userId}`,
    });

    return vectorStore;
}

async function loadPDF(pdfPath, vectorStore) {
    const pdfName = pdfPath.split("/").pop().replace(".pdf", "");

    const { pdfTextData, pdfLinksData, pdfImagesData } = await PDFLoader(pdfPath, true);
    const texts = await splitText(pdfName, pdfTextData, pdfImagesData, pdfLinksData, 500, 50, false);

    console.log("Texts split into chunks:", texts.length);

    await vectorStore.addDocuments(texts);
    for(const imagePath of pdfImagesData) {
        try {
            fs.unlinkSync(imagePath); // Clean up image files after processing
        } catch (error) {
            console.error(`Error processing image ${imagePath}:`, error);
        }
    }
}

async function chatWithPDF(vectorStore, query, topK) {
    const results = await vectorStore.similaritySearch(query, topK);
    // console.log("Search Results:", results);
    return results;
}

async function main() {
    // TODO : we'll need pdfPaths, query, userId to execute the main workflow
    const pdfPaths = [
        "./uploads/TSA-1-2.pdf",
        // "./uploads/missingpy.pdf"
    ];
    // const pdfPaths = ["./uploads/TSA-1-2.pdf"];
    const queries = [
        "What are the key findings and patterns discovered in this time series analysis of air passenger data?",
        // "What is the KNNImputer also what are other imputer methods available in sklearn?",
    ];
    const userId = "madhavJivani"; // Example user ID

    const vectorStore = await configureVectorStore(userId);

    for (const pdfPath of pdfPaths) {
        await loadPDF(pdfPath, vectorStore);
        console.log("PDF loaded and processed successfully.", pdfPath);
    }

    for (const query of queries) {
        const results = await chatWithPDF(vectorStore, query , 3);
        // fs.writeFileSync(`./dump/chat/${query}.json`, JSON.stringify(results, null, 2));

        return await finalResponse(query, results);
    }
}

const startTime = Date.now();
main().then(({reply, chat}) => {
    console.log("Main function executed successfully.\n\n\n");

    console.log("Final Response:", reply,"\n\n");
    const endTime = Date.now();
    const seconds = ((endTime - startTime) / 1000).toFixed(2);
    console.log(`Execution time: ${seconds} seconds`);
});