import { Input, mergeClasses } from "@fluentui/react-components";
import { Search12Regular } from "@fluentui/react-icons";



export default function Header({ className }: { className?: string }) {
    return (
        <header id="app-header" className={mergeClasses(className, "flex justify-center rouded")}>
            <Input className="w-1/2 my-2"
                placeholder="Search"
                contentBefore={<Search12Regular />} />
        </header>
    );
}