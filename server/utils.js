export const chunkMetaData = {
    fileInfo: {
        source: "pdf",
        fileName: "untitled.pdf",
        totalPages: undefined,
    },
    pageStats: {
        pageNumber: undefined,
        imagesCount: undefined,
        linksCount: undefined,
    },
    chunk: {
        index: undefined,
        type: "text", // default to text
        description: undefined, // for images or links
    }
};

import { imageChat as ImageChat } from './multiModal.chat.js'

export const splitText = async (pdfName, pdfTextData, pdfImagesData, pdfLinksData, chunkSize = 500, chunkOverlap = 0, feedImages = false) => {
    chunkOverlap = ((chunkOverlap < 0) ? 0 : chunkOverlap % chunkSize) || 0;
    const splitDocs = [];
    let globalChunkIdx = 1; // Global chunk counter across all pages

    // Group images by page number
    const imagesByPage = getImageByPage(pdfImagesData);

    for (let pageNum = 0; pageNum < pdfTextData.totalPages; pageNum++) {
        const pageText = pdfTextData.text[pageNum] || "";
        let start = 0;
        let end = 0;

        while (start < pageText.length) {
            end = Math.min(start + chunkSize, pageText.length);

            const chunkWords = pageText.slice(start, end);

            if (chunkWords.trim().length > 0) {
                // chunkMetaData
                const textChunkMetaData = {
                    fileInfo: {
                        source: "pdf",
                        fileName: pdfName,
                        totalPages: pdfTextData.totalPages,
                    },
                    pageStats: {
                        pageNumber: pageNum + 1,
                        imagesCount: (imagesByPage[pageNum + 1] || []).length,
                        // linksCount: chunkMetaData.pageStats.linksCount,
                    },
                    chunk: {
                        index: globalChunkIdx++,
                        type: "text",
                        description: undefined, // No description for text chunks
                    }
                }
                splitDocs.push({ pageContent: chunkWords, metadata: textChunkMetaData });
            }

            start += Math.min(end - chunkOverlap, pageText.length);
        }
    }

    // Process images
    if (feedImages && pdfImagesData && pdfImagesData.length > 0) {
        const imageDescriptions = await ImageChat(pdfImagesData);
        for (const imageDesc of imageDescriptions) {
            const { pageNumber:imagePageNumber, imageIndex, description:imageDescription } = imageDesc;
            // chunkMetaData
            const imageChunkMetaData = {
                fileInfo: {
                    source: "pdf",
                    fileName: pdfName,
                    totalPages: pdfTextData.totalPages,
                },
                pageStats: {
                    pageNumber: imagePageNumber,
                    imagesCount: (imagesByPage[imagePageNumber] || []).length,
                    // linksCount: chunkMetaData.pageStats.linksCount,
                },
                chunk: {
                    image_reference: `This is ${imageIndex}th image on page ${imagePageNumber} of ${pdfName} PDF`,
                    index: imageIndex,
                    type: "image",
                    description: imageDescription,
                }
            }
            splitDocs.push({ pageContent: imageDescription, metadata: imageChunkMetaData });
        }
    }

    return splitDocs;
}

export const getImageMap = (pdfImagesData) => {
    const imagesMap = {};

    // Create a map of filename to full path
    for (const image of pdfImagesData) {
        const filename = image.split('/').pop().replace(".png", "");
        imagesMap[filename] = image;
    }

    return imagesMap;
}
export const getImageByPage = (pdfImagesData) => {
    const imagesByPage = {};

    // Group images by page number
    for (const imgPath of pdfImagesData) {
        const [page] = imgPath.split('/').pop().split('_');
        const pageNum = parseInt(page);
        if (!imagesByPage[pageNum]) imagesByPage[pageNum] = [];
        imagesByPage[pageNum].push(imgPath);
    }

    return imagesByPage;
}