import { useEffect } from "react";
import { usePaperDispatch } from "../papers/paper-context";

export function DropHandlerContextProvider({ children }: { children: JSX.Element | JSX.Element[] }) {
    const dispatchPapers = usePaperDispatch();
    // TODO: Progress bar
    useEffect(() => {
        const dragOverHandler = (event: DragEvent) => event.preventDefault(); // prevent default to allow drop
        const dropHandler = async (event: DragEvent) => {
            event.preventDefault();
            if (event.dataTransfer) {
                window.AppServices.DropService.handleDrop(event.dataTransfer.files);
                window.AppServices.PaperService.getAllPapers().then(papers => {
                    dispatchPapers({ type: "LOAD_PAPERS", papers });
                });
            }
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