import { mergeClasses } from "@fluentui/react-components";
import { PaperDetails } from "./paper-details";

export default function Panel({ className }: { className?: string }) {
    return (
        <aside className={mergeClasses(className, "flex ml-3")}>
            {/* <PaperDetails /> */}
        </aside>
    );
}