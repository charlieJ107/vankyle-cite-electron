import { usePaperContext } from "@components/contexts/papers/paper-context";
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