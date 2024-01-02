import { mergeClasses } from "@fluentui/react-components";
import { ReactNode, createContext, useContext, useState } from "react";

const TooltipRefContext = createContext<HTMLElement | null>(null);

export function SideBarNav({ className, children }: { className?: string, children: ReactNode }) {
    const [tooltipRef, setTooltipRef] = useState<HTMLElement | null>(null);
    return (
        <TooltipRefContext.Provider value={tooltipRef}>
            <nav ref={setTooltipRef}
                className={mergeClasses(className, "rounded-r py-5 px-1 flex flex-col overflow-x-visible")}>
                {children}
            </nav>
        </TooltipRefContext.Provider>
    );

}

export function useTooltipRef() {
    return useContext(TooltipRefContext);
}