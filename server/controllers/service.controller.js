import fs from 'fs'
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { main as PDFLoader } from '../pdfLoader.js'
import { splitText } from "../utils.js";
import { finalResponse, confirmIfVectorSearchNeeded} from "../multiModal.chat.js";

let vectorStoreInstance = null;

export const uploadPDF = async (req, res) => {
    try {
        console.log(req.file);
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const userId = req.userId;
        const filePath = req.file.path;

        // Configure the vector store for the user
        vectorStoreInstance = await configureVectorStore(userId);
        await loadPDF(filePath, vectorStoreInstance);

        fs.unlinkSync(filePath); // Clean up the uploaded file after processing
        res.status(200).json({ message: 'File uploaded successfully', filePath });
    } catch (error) {
        console.error("Error uploading PDF:", error);
        // Clean up uploaded file if upload fails
        if (req.file && req.file.path) {
            fs.unlinkSync(req.file.path);
        }
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

export const chat = async (req, res) => {
    try {
        const { query, chatHistory } = req.body;
        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }
        if (!vectorStoreInstance) {
            return res.status(500).json({ error: 'Vector store not initialized' });
        }
        // TODO: Not properly working for now.
        // if(chatHistory){
        //     // check if query has to do with vectorStore, if yes enhance the query else answer form chatHistory
        //     const output = await confirmIfVectorSearchNeeded(query, chatHistory);
        //     if (output.action === "answer") {
        //         return res.status(200).json({ reply: output.reply, chat: chatHistory });
        //     }
        //     query = output.query; // Use the enhanced query for vector search
        // }
        const results = await chatWithPDF(vectorStoreInstance, query, 3);
        let reply = undefined, chat = undefined;
        
        // Parse chatHistory properly to avoid character array issue
        let validChatHistory = null;
        if (chatHistory) {
            try {
                // If chatHistory is a string, parse it. If it's already an object/array, use it
                const parsed = typeof chatHistory === 'string' ? JSON.parse(chatHistory) : chatHistory;
                // Ensure it's an array and not a string that got spread into characters
                validChatHistory = Array.isArray(parsed) ? parsed : null;
            } catch (error) {
                console.error("Error parsing chatHistory:", error);
                validChatHistory = null;
            }
        }
        
        if (validChatHistory) {
            const { reply: replyFromChat, chat: chatFromHistory } = await finalResponse(query, results, validChatHistory);
            reply = replyFromChat;
            chat = chatFromHistory;
        }
        else {
            const { reply: replyFromChat, chat: chatFromHistory } = await finalResponse(query, results);
            reply = replyFromChat;
            chat = chatFromHistory;
        }
        return res.status(200).json({ reply, chat });
    } catch (error) {
        console.error("Error in chat:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};



// AI Part

async function configureVectorStore(userId) {
    const embeddings = new OpenAIEmbeddings({
        model: "text-embedding-3-small",
    });

    // This will create the collection if it doesn't exist, or use existing one
    // Note: Collection names cannot contain ':' in Qdrant
    const vectorStore = new QdrantVectorStore(embeddings, {
        apiKey: process.env.QDRANT_API_KEY,
        url: process.env.QDRANT_URL,
        collectionName: `user_${userId}`,
    });

    return vectorStore;
}

async function loadPDF(pdfPath, vectorStore) {
    const pdfName = pdfPath.split("/").pop().replace(".pdf", "");

    const { pdfTextData, pdfLinksData, pdfImagesData } = await PDFLoader(pdfPath, true);
    const texts = await splitText(pdfName, pdfTextData, pdfImagesData, pdfLinksData, 500, 50);

    console.log("Texts split into chunks:", texts.length);

    await vectorStore.addDocuments(texts);
    for (const imagePath of pdfImagesData) {
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