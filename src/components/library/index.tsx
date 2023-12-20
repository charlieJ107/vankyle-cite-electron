import { mergeClasses, typographyStyles } from "@fluentui/react-components";
import PapersList from "./papers";


export default function Library({ className }: { className?: string }) {
    return (
        <section className={mergeClasses(className, "flex flex-col flex-grow rounded m-3")}>
            <PapersList />
        </section>
    );
}