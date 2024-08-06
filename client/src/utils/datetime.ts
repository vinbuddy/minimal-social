export const formatTimeStamp = (ISO8601String: string): string => {
    const dateTime = new Date(ISO8601String);

    // Get date components
    const year = dateTime.getFullYear();
    const month = String(dateTime.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const day = String(dateTime.getDate()).padStart(2, "0");

    // Get time components
    const hours = String(dateTime.getHours()).padStart(2, "0");
    const minutes = String(dateTime.getMinutes()).padStart(2, "0");

    const formattedDate = `${year}-${month}-${day}`;
    const formattedTime = `${hours}:${minutes}`;

    return `${formattedTime}, ${formattedDate}`;
};
