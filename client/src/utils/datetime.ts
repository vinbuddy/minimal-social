export const formatTimeStamp = (ISO8601String: string): string => {
    const dateTime = new Date(ISO8601String);

    // Get date components
    const year = dateTime.getFullYear();
    const month = String(dateTime.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const day = String(dateTime.getDate()).padStart(2, "0");

    // Get time components
    const hours = dateTime.getHours();
    const minutes = dateTime.getMinutes();

    const formattedDate = `${year}-${month}-${day}`;
    const formattedTime = `${hours}:${minutes}`;

    return `${formattedTime}, ${formattedDate}`;
};
