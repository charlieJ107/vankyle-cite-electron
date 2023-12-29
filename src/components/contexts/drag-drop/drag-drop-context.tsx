import { useEffect } from "react";

export function DropEventListenerContextProvider({ children }: { children: JSX.Element | JSX.Element[] }) {
    useEffect(() => {
        const dragOverHandler = (event: DragEvent) => event.preventDefault(); // prevent default to allow drop
        const dropHandler = (event: DragEvent) => {
            event.preventDefault();
            console.log("drop");
            // window.AppServiceProvider.dragHandler(event);
        }

        document.addEventListener("dragover", dragOverHandler);
        document.addEventListener("drop", dropHandler);
        return () => {
            document.removeEventListener("drop", dragOverHandler);
            document.removeEventListener("dragover", dropHandler);
        }
    }, []);
    return (
        <>
            {children}
        </>
    );
}