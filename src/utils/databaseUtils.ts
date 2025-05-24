export async function fileToUrl(file: File): Promise<string> {
    return URL.createObjectURL(file);
}