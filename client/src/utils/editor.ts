export const setCaretAtTheEnd = (element: HTMLDivElement): void => {
    if (element.getAttribute("contenteditable") === "true") {
        element.focus();
        window.getSelection()!.selectAllChildren(element);
        window.getSelection()!.collapseToEnd();
    }
};
