import { ExternalToast, toast } from "sonner";

export const TOAST_OPTIONS: ExternalToast = {
    position: "bottom-center",
};

export const showToast = (
    message: string,
    type: "success" | "error" | "info" | "warning" = "success",
    options: ExternalToast = {}
) => {
    toast[type](message, {
        ...TOAST_OPTIONS,
        ...options,
    });
};
