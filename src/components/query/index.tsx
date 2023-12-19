import { mergeClasses } from "@fluentui/react-components";
import Tags from "./tags";
import Search from "./search";

export default function Query({ className }: { className?: string }) {

    return (
        <section className={mergeClasses(className, "px-2 py-3 m-3 rounded")}>
            <Search />
            <Tags />
        </section>
    );
}