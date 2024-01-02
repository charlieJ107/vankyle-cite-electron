import { makeStyles, mergeClasses, tokens } from "@fluentui/react-components"
import Board from "@components/main-view/board";
import Library from "@components/main-view/library";
import Panel from "@components/main-view/panel";

const useStyle = makeStyles({
    main: {
        display: "flex",
        flexGrow: "1",
        backgroundColor: tokens.colorNeutralBackground5,
        columnGap: "0.5rem",
        paddingLeft: "0.5rem",
        paddingRight: "0.5rem",
    },
    element: {
        backgroundColor: tokens.colorNeutralBackground1,
    },
    panels: {
        flexGrow: "1",
        overflowY: "auto",
    },
    central: {
        flexGrow: "3",
        overflowY: "auto",
    },
    board: {
        flexShrink: "1",
        overflowY: "auto",
    }
});

export default function MainView() {
    const style = useStyle();

    return (
        <main className={mergeClasses(style.main)}>
            <Board className={mergeClasses(style.board, style.element)} />
            <Library className={mergeClasses(style.central, style.element)} />
            <Panel className={mergeClasses(style.panels, style.element)} />
        </main>
    )
}