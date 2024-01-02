import { useEffect } from "react";

export function DropHandlerContextProvider({ children }: { children: JSX.Element | JSX.Element[] }) {
    useEffect(() => {
        const dragOverHandler = (event: DragEvent) => event.preventDefault(); // prevent default to allow drop
        const dropHandler = async (event: DragEvent) => {
            event.preventDefault();
            // TODO
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