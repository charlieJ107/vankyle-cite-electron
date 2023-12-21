import { mergeClasses } from "@fluentui/react-components";
import { PaperDetails } from "./paper-details";
import { usePaperContext } from "../../../contexts/papers";


export default function Panel({ className }: { className?: string }) {
    const papers = usePaperContext();
    // TODO: add a button to close the panel
    return (
        <aside className={mergeClasses(className, "flex m-3 rounded p-3")}>
            {papers.focusedPaper ? <PaperDetails paper={papers.focusedPaper} /> : null}
        </aside>
    );

}

