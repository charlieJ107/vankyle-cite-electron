import { useEffect } from "react";

export function DropEventListenerContextProvider({ children }: { children: JSX.Element | JSX.Element[] }) {
    useEffect(() => {
        document.addEventListener("dragover", (event) => {
            // prevent default to allow drop
            event.preventDefault();
        });
        document.addEventListener("drop", (event) => {
            event.preventDefault();
            console.log("drop");
            // window.AppServiceProvider.dragHandler(event);
        });
        return () => {
            document.removeEventListener("drop", (_event) => { });
            document.removeEventListener("dragover", (_event) => { });
        }
    }, []);
    return (
        <>
            {children}
        </>
    );
}