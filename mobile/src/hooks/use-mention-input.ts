import { useEffect, useMemo, useRef, useState } from "react";
import { TextInputSelectionChangeEvent } from "react-native";

import { plainToRichText } from "@/lib/rich-text";
import { searchUsers } from "@/services/users";
import useAuthStore from "@/stores/auth-store";
import { IUser } from "@/types/user";

const SEARCH_DELAY_MS = 300;

/**
 * Plain-text input with @mention suggestions, the app's version of the web's contenteditable editor.
 * Typing "@li" searches users; picking one inserts "@linh " and links it when the text is turned into
 * the web's caption HTML (`toHtml`).
 */
export function useMentionInput(initialText = "", initialMentions: string[] = []) {
    const currentUser = useAuthStore((state) => state.currentUser);
    const [text, setText] = useState(initialText);
    const [selection, setSelection] = useState({ start: initialText.length, end: initialText.length });
    // Results are kept with the query they answer, so stale ones are never shown for a newer "@word"
    const [results, setResults] = useState<{ query: string; users: IUser[] }>({ query: "", users: [] });
    const mentioned = useRef(new Set(initialMentions));

    // The "@word" right before the caret, if any
    const query = useMemo(() => {
        if (selection.start !== selection.end) return null;
        const match = /(?:^|\s)@(\w*)$/.exec(text.slice(0, selection.start));
        return match ? match[1] : null;
    }, [text, selection]);

    useEffect(() => {
        if (!query) return;

        let isCancelled = false;
        const timer = setTimeout(async () => {
            try {
                const blocked = new Set(currentUser?.blockedUsers?.map((user) => user._id));
                const users = await searchUsers(query);
                if (!isCancelled) setResults({ query, users: users.filter((user) => user._id !== currentUser?._id && !blocked.has(user._id)).slice(0, 6) });
            } catch {
                if (!isCancelled) setResults({ query, users: [] });
            }
        }, SEARCH_DELAY_MS);

        return () => {
            isCancelled = true;
            clearTimeout(timer);
        };
    }, [query, currentUser]);

    const suggestions = query && results.query === query ? results.users : [];

    const pickSuggestion = (user: IUser) => {
        const before = text.slice(0, selection.start).replace(/@\w*$/, `@${user.username} `);
        const after = text.slice(selection.end);
        mentioned.current.add(user.username);
        setText(before + after);
        setSelection({ start: before.length, end: before.length });
    };

    return {
        text,
        setText,
        suggestions,
        pickSuggestion,
        /** Spread onto the TextInput */
        inputProps: {
            value: text,
            onChangeText: (next: string) => {
                // Typing at the end keeps the caret at the end. Native fires onSelectionChange as well,
                // but react-native-web doesn't while typing, which would leave the caret behind
                if (selection.start === text.length && selection.end === text.length) {
                    setSelection({ start: next.length, end: next.length });
                }
                setText(next);
            },
            onSelectionChange: (event: TextInputSelectionChangeEvent) => setSelection(event.nativeEvent.selection),
        },
        toHtml: () => plainToRichText(text, mentioned.current),
        reset: () => {
            setText("");
            setSelection({ start: 0, end: 0 });
            mentioned.current = new Set();
        },
    };
}
