import PaperItem from "./paper-item";
import { usePapers } from "./use-papers";

export default function PapersList() {
    const papers = usePapers();
    return (
        <div>
            {papers.map((paper, index) => (
                <PaperItem key={index} paper={paper} />
            ))}
        </div>
    );
}