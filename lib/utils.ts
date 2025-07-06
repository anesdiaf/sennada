import * as FileSystem from 'expo-file-system';
export const base64ToDataUri = (base64: string, mimeType: string): string => {
    return `data:${mimeType};base64,${base64}`;
};


export const UriToBase64 = async (uri: string) => {
    try {
        // Convert to base64
        const base64 = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
        });

        // Get file info
        const mimeType = getMimeTypeFromUri(uri);


        return { base64, mimeType }
    } catch (error) {
        console.error("Error storing image as base64:", error);
        throw error;
    }
}

export const getMimeTypeFromUri = (uri: string): string => {
    const extension = uri.split(".").pop()?.toLowerCase();
    switch (extension) {
        case "jpg":
        case "jpeg":
            return "image/jpeg";
        case "png":
            return "image/png";
        case "gif":
            return "image/gif";
        case "webp":
            return "image/webp";
        default:
            return "image/jpeg";
    }
}

export const formatToDZD = (number: number) => {
    const formatted = number.toLocaleString('fr-FR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    return `${formatted} D.A`;
}