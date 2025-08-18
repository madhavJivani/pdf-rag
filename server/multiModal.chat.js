const IMAGE_SYSTEM_PROMPT = `Explain or Describe what do you see in the image/s
I will provide image after image, you will analyze each image and provide a detailed description of what you see in the image.
It may be that they are related to each other, so you should consider the context of the previous images when analyzing the current image.
It may be a case where the image is related to some organization or a placeholder or anything else that does not provide any value to the user.
So keep your responses concise and relevant to the image content.
`;

export const FINAL_RESPONSE_SYSTEM_PROMPT = `You are a helpful assistant that provides concise and relevant answers based on the provided context.
You will receive a user query and a set of relevant chunks from a document.[These chunks will seem to be JSON stringified coz they are from a vector store]
Your task is to generate a final response that directly addresses the user's query using the provided context.
You should use the information very-wisely to address the userQuery as smartly as possible.
Provide information that is needed if short answer is enough to answer the user query. go with that else try to provide a detailed answer.
If the user query is not related to the context, you should politely inform the user that you cannot provide an answer based on the given context.

You are not allowed to make up information or provide answers that are not supported by the context.
While you are expected to think and evaluate your reply : Is your reply adding any value to the user or not / Is it addressing user query or not.

It may be the case when user's query can be answered from context of chat previously provided by user and is less related to context provided by vector store.
In that case, you should provide the answer based on the chat context only and not use the vector store context.

ACT SMART,DON'T BE A GEEK.
`
export const QUERY_ENHANCEMENT_SYSTEM_PROMPT = `You are an extraordinary smart assistant to resolve userQueries OR Enhance them conditionally.
You will receive a user query and a previous chat history.
Your 1st task is to identify if the userQuery can be answered based on previous conversation or do we need to query our VECTOR DATABASE to get more relevant context

NOTE : Be very clear about your decision, if you think the userQuery can be answered based on previous conversation, 
But you need more context from the vector store, you should enhance the userQuery with relevant context from the vector store.

Your 2nd technically optional task is to enhance the userQuery so vector search produces a better result thus correctly answering the query and improves the response quality.
Please ensure that the enhanced query is relevant to the context and does not deviate from the original intent of the userQuery. Do consider chatHistory as parameter to produce a better user Query.
If the userQuery is already clear and does not require enhancement keep it intact.

Basically you will we provided with userQuery and chatHistory, if you think you can answer query based on chatHistory only, no need for vector search,
then you return the response that we should provide to user.
So in that case Output looks like {action:"answer", reply: ".... the reply we should forward to user"}


Else if you think we need to query the vector store to get more relevant context, then you return the better query
In this case Output looks like {action:"enhance", query: "the enhanced query to be used for vector search"}

Please follow the exact same output format as described above. no other format is allowed.
`

import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import dotenv from "dotenv";
import fs from "fs";
import { getImageMap } from "./utils.js";

dotenv.config();

const messages = [
    {
        role: "system",
        content: IMAGE_SYSTEM_PROMPT,
    },
];

export async function imageChat(pdfImagesData) {
    const imageMap = getImageMap(pdfImagesData);

    const chatModel = new ChatOpenAI({
        model: "gpt-4o-mini",
        temperature: 0.2,
        maxTokens: 2048,
    });
    const responses = [];
    for (const [filename, imagePath] of Object.entries(imageMap)) {
        const imageData = fs.readFileSync(imagePath);
        const [pageNumber, imageIndex] = filename.split("_");
        if (!imageData) {
            throw new Error("Image data is empty or not found");
        }
        if (!imagePath.endsWith(".png")) {
            throw new Error("Image path must end with .png");
        }
        messages.push({
            role: "user",
            content: [
                { type: "text", text: `Page Number: ${pageNumber}, Image Index: ${imageIndex}` },
                {
                    type: "image_url",
                    image_url: {
                        url: `data:image/png;base64,${imageData.toString("base64")}`,
                    },
                },
            ],
        });
        const response = await chatModel.invoke(messages);
        // console.log(`Response for ${filename}:`, response.content);
        if (!response.content) {
            throw new Error("No content received from the model");
        }
        responses.push({
            pageNumber: pageNumber,
            imageIndex: imageIndex,
            description: response.content,
        });
        messages.push({
            role: "assistant",
            content: response.content,
        });
    }

    // Save responses to a file
    // fs.writeFileSync(`./dump/chatResponses.json`, JSON.stringify(responses, null, 2));
    // console.log("Chat responses saved to ./dump/chatResponses.json");
    // fs.writeFileSync(`./dump/chat.json`, JSON.stringify(messages, null, 2));
    return responses;
}

export async function finalResponse(userQuery, relevantChunks, prevMessages = [new SystemMessage(FINAL_RESPONSE_SYSTEM_PROMPT)]) {
    const llm = new ChatOpenAI({
        model: "gpt-4o",
        temperature: 0,
    });

    const messages = [
        ...prevMessages,
        new SystemMessage(`Relevant context for answering the user's question:\n\n${relevantChunks}`),
        new HumanMessage(userQuery),
    ];

    const response = await llm.invoke(messages);
    messages.push(new AIMessage(response.content));
    // console.log("Final Response:", response.content);
    return { reply: response.content, chat: messages };
}

export const confirmIfVectorSearchNeeded = async (userQuery, chatHistory) => {
    // Analyze the userQuery and chatHistory to determine if vector search is needed
    const llm = new ChatOpenAI({
        model: "gpt-4o",
        temperature: 0,
    });

    const messages = [
        ...chatHistory,
        new SystemMessage(QUERY_ENHANCEMENT_SYSTEM_PROMPT),
        new SystemMessage("Below is the user query that needs to be analyzed:"),
        new HumanMessage(userQuery),
    ];

    const response = await llm.invoke(messages);
    console.log("Query Enhancement Response:", response);
    const output = JSON.parse(response.content);

    console.log("Query Enhancement Output:", output);
    return output;
}