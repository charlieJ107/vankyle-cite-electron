import { Button, mergeClasses } from "@fluentui/react-components";
import { Library16Regular } from "@fluentui/react-icons";

export default function SideBar({ className }: { className?: string }) {
    return (
        <aside className={mergeClasses(className, "py-5 px-3 mr-3 rounded-r")}>
            <Button icon={<Library16Regular />} className="w-3"></Button>
        </aside>
    );
}