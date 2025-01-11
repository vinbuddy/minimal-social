import { AxiosError } from "axios";
import cn from "classnames";

interface ErrorResponse {
    message?: string;
}

interface IProps {
    error: AxiosError<ErrorResponse> | null;
    customMessage?: string;
    className?: string;
}

export default function ErrorMessage({ error, customMessage, className }: IProps) {
    if (!error) return null;

    let message = "An error occurred. Please try again later.";

    if (customMessage) {
        message = customMessage;
    }

    if (error.response?.data.message) {
        message = error.response.data.message;
    }

    return <div className={cn("text-danger", className)}>{message}</div>;
}
