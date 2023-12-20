import { Button, Tooltip, makeStyles, mergeClasses, tokens } from "@fluentui/react-components";

const useSideBarStyle = makeStyles({
    iconButtons: {
        marginTop: tokens.spacingVerticalM,
    }
});

export function SidebarIconButton(
    { className, tooltipRef, icon, content }:
        {
            className?: string,
            tooltipRef: HTMLElement | null,
            icon: JSX.Element,
            content: string
        }) {
    const style = useSideBarStyle();
    return (
        <Tooltip content={content} relationship="label" positioning="after" mountNode={tooltipRef}>
            <Button className={mergeClasses(className, style.iconButtons)} icon={icon} size="large" />
        </Tooltip>
    );

}