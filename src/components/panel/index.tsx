import { mergeClasses } from "@fluentui/react-components";

export default function Panel({ className }: { className?: string }) {
    return (
        <aside className={mergeClasses(className, "flex ml-3")}>
            <h1>Panel</h1>
        </aside>
    );
}