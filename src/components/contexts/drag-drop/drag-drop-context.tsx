import { useEffect } from "react";

export function DropEventListenerContextProvider({ children }: { children: JSX.Element | JSX.Element[] }) {
    useEffect(() => {
        document.addEventListener("drop", (event) => {
            event.preventDefault();
            event.stopPropagation();
            // ipcRenderer.send("drop-file", event.dataTransfer?.files[0].path);
        });
        return () => {
            document.removeEventListener("drop", () => { });
        }
    }, []);
    return (
        <>
            {children}
        </>
    );
}