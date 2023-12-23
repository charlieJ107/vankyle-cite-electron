import { makeStyles, mergeClasses, tokens } from "@fluentui/react-components";
import { AppsAddInRegular, BoardRegular } from "@fluentui/react-icons";
import { useState } from "react";
import { SidebarIconButton } from "./side-bar-icon-button";

export const useStyle = makeStyles({
    sideBar: {
        backgroundColor: tokens.colorBrandBackground2,
        zIndex: 1
    }
});

export default function SideBar() {
    const [tooltipRef, setTooltipRef] = useState<HTMLElement | null>(null);
    const style = useStyle();
    return (
        <nav ref={setTooltipRef} className={mergeClasses(style.sideBar, "rounded-r py-5 px-2 flex flex-col overflow-x-visible")}>
            <SidebarIconButton tooltipRef={tooltipRef} icon={<BoardRegular />} content="Home" />
            {/* TODO: Addins icons and extension system */}
            <SidebarIconButton tooltipRef={tooltipRef} icon={<AppsAddInRegular />} content="Add Ins" />
        </nav>
    );

}