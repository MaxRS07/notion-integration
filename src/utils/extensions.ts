
export const camelToTitleCase = function (camelString: string): string {
    const result = camelString.replace(/([A-Z])/g, " $1");
    return result.charAt(0).toUpperCase() + result.slice(1);
}