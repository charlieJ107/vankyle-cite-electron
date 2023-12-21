import { makeStyles, mergeClasses, tokens } from "@fluentui/react-components"
import Board from "./board";
import Library from "./library";
import Panel from "./panel";

const useStyle = makeStyles({
    main: {
        display: "flex",
        flexGrow: "1",
        backgroundColor: tokens.colorNeutralBackground3,
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