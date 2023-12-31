import { useEffect } from "react";
import { DatabaseService } from "../../../services/DatabaseService/DatabaseService";

export function DropEventListenerContextProvider({ children }: { children: JSX.Element | JSX.Element[] }) {
    useEffect(() => {
        const dragOverHandler = (event: DragEvent) => event.preventDefault(); // prevent default to allow drop
        const dropHandler = async (event: DragEvent) => {
            event.preventDefault();
            console.log("drop");
            const dataService = await window.AppServiceProvider.getService<DatabaseService>("database-service");
            const models = await dataService.call("getList", "Paper");
            console.log("models");
            console.log(models);
            // TODO: handle drop
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