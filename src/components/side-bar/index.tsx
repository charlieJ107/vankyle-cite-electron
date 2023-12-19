import { Button, mergeClasses } from "@fluentui/react-components";
import { BoardRegular } from "@fluentui/react-icons";

export default function SideBar({ className }: { className?: string }) {
    return (
        <aside className={mergeClasses(className, "rounded-r py-5 px-2")}>
            <Button className={mergeClasses(className,"m-2")} icon={<BoardRegular />} size="large"/>
        </aside>
    );

}