import { Button, Tooltip, makeStyles, mergeClasses, tokens } from "@fluentui/react-components";
import { useTooltipRef } from "../side-bar/context/tooltip-ref-context";
import React from "react";

const useSideBarStyle = makeStyles({
    iconButtons: {
        marginTop: tokens.spacingVerticalXS,
    }
});

export function SidebarIconButton(
    { className, icon, content, onClick }:
        {
            className?: string;
            icon: JSX.Element;
            content: string;
            onClick?: React.MouseEventHandler<HTMLButtonElement>;
        }) {
    const style = useSideBarStyle();
    const toolTipRef = useTooltipRef();
    return (
        <Tooltip content={content} relationship="label" positioning="after" mountNode={toolTipRef}>
            <Button className={
                mergeClasses(
                    className,
                    style.iconButtons,
                )}
                as="button"
                onClick={onClick}
                icon={icon} size="large"
                appearance="subtle" />
        </Tooltip>
    );

}