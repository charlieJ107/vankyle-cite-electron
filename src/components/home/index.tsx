import { mergeClasses, typographyStyles } from "@fluentui/react-components";
import { _dummyPapersForDev } from "../../models/paper";
import PaperItem from "./paper";


export default function Home({ className }: { className?: string }) {
    const papers = _dummyPapersForDev;
    return (
        <section className={mergeClasses(className, "rounded m-3")}>
            <div className="border p-3">
                <h1 style={typographyStyles.title1}>Library</h1>
            </div>
            <div>
                {papers.map((paper, index) => (
                    <PaperItem key={index} paper={paper} />
                ))}
            </div>
        </section>
    );
}