import { mergeClasses } from "@fluentui/react-components";

export default function Home({ className }: { className?: string }) {
    return (
    <section className={mergeClasses(className)}>
        <h1>Library</h1>

    </section>
    );
}