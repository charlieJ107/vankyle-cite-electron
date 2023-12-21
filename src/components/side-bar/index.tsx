import { mergeClasses } from "@fluentui/react-components";
import { AppsAddInRegular, BoardRegular } from "@fluentui/react-icons";
import { useState } from "react";
import { SidebarIconButton } from "./side-bar-icon-button";


export default function SideBar({ className }: { className?: string }) {

    const [tooltipRef, setTooltipRef] = useState<HTMLElement | null>(null);
    return (
        <nav ref={setTooltipRef} className={mergeClasses(className, "rounded-r py-5 px-2 flex flex-col overflow-x-visible")}>
            <SidebarIconButton tooltipRef={tooltipRef} icon={<BoardRegular />} content="Home" />
            {/* TODO: Addins icons and extension system */}
            <SidebarIconButton tooltipRef={tooltipRef} icon={<AppsAddInRegular />} content="Add Ins" />
        </nav>
    );

}