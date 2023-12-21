import { usePaperContext } from "../../../../contexts/papers";
import PaperItem from "./paper-item";

export default function PapersList() {
    const paperContext = usePaperContext();
    return (
        <div>
            {paperContext.filteredPapers.map((paper, index) => (
                <PaperItem key={index} paper={paper} />
            ))}
        </div>
    );
}