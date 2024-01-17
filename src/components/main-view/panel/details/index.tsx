import { usePaperContext } from "../../../contexts/papers/paper-context";
import { PaperDetails } from "./paper-details";

export function DetailsPanel() {
    const papers = usePaperContext();
    if (papers.focusedPaper) {
        return (
            <PaperDetails paper={papers.focusedPaper} />
        );
    } else {
        return (
            <div className="flex flex-grow">
                <div className="flex flex-col justify-center items-center flex-grow">
                    <h1 className="text-3xl">No paper selected</h1>
                    <p className="text-xl">Select a paper to see details</p>
                </div>
            </div>
        );
    }
}