import { useEffect } from "react";

export function DropEventListenerContextProvider({ children }: { children: JSX.Element | JSX.Element[] }) {
    console.log(window.AppServiceProvider);
    window.AppServiceProvider.hello();
    useEffect(() => {
        // window.AppServiceProvider.hello();
        document.addEventListener("drop", (event) => {
            event.preventDefault();
            event.stopPropagation();
            // ipcRenderer.send("drop-file", event.dataTransfer?.files[0].path);
            // fileHandler(event);
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