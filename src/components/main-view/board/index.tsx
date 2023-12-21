import { mergeClasses } from "@fluentui/react-components";
import Tags from "./tags";
import Search from "./search";

export default function Board({ className }: { className?: string }) {

    return (
        <section className={mergeClasses(className, "flex flex-col px-2 py-3 m-3 rounded justify-between")}>
            <Search />
            <Tags />
        </section>
    );
}