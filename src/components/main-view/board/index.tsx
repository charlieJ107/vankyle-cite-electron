
import { mergeClasses } from "@fluentui/react-components";
import { FilterBoard } from "./filter";


export default function Board({ className }: { className?: string }) {
    return (
        <section className={mergeClasses(className, "flex flex-col px-2 py-3 my-2 rounded justify-between")}>
            <FilterBoard />
        </section>
    );
}