import { makeStyles, tokens } from "@fluentui/react-components";
import { AppsAddInRegular, BoardRegular } from "@fluentui/react-icons";
import { SidebarIconButton } from "@components/side-bar/side-bar-icon-button";
import { SideBarNav } from "@components/side-bar/context/tooltip-ref-context";
import { useBoardDispatch } from "@components/contexts/boards/board-context";

export const useStyle = makeStyles({
    sideBar: {
        backgroundColor: tokens.colorBrandBackground2,
        zIndex: 100
    }
});

export default function SideBar() {
    const style = useStyle();
    const dispatchBoard = useBoardDispatch();
    return (
        <SideBarNav className={style.sideBar}>
            <SidebarIconButton icon={<BoardRegular />} content="Exploer" onClick={() => { dispatchBoard({ board: "exploer" }) }} />
            {/* TODO: Addins icons and extension system */}
            <SidebarIconButton icon={<AppsAddInRegular />} content="Add Ins" />
        </SideBarNav>
    );

}