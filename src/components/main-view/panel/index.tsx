import { Button, SelectTabData, SelectTabEvent, Tab, TabList, TabValue, mergeClasses } from "@fluentui/react-components";
import { DetailsPanel } from "./details";
import { usePaperContext, usePaperDispatch } from "../../../contexts/papers/paper-context";
import { DismissRegular } from "@fluentui/react-icons";
import { useState } from "react";
import { BlockTab } from "../../../contexts/tabs/tabs-context-types";


export default function Panel({ className }: { className?: string }) {
    const papers = usePaperContext();
    const dispatchPaper = usePaperDispatch();
    const tabs: BlockTab[] = [
        {
            id: "details",
            name: "Details",
        }
    ]; // TODO: Dynamically generate tabs
    const [tab, setTab] = useState<TabValue>(tabs[0].id);

    const onTabSelect = (_event: SelectTabEvent, data: SelectTabData) => {
        setTab(data.value);
    };

    // TODO: Details panel or related panel or others
    if (papers.focusedPaper) {
        return (
            <aside className={mergeClasses(className, "flex flex-col my-2 rounded p-2")}>
                <div className="flex flex-row mb-3 justify-between">
                    <TabList className={mergeClasses("flex")}
                        defaultSelectedValue={tab}
                        selectedValue={tab}
                        onTabSelect={onTabSelect}>
                        {tabs.map((tab, index) => (
                            <Tab key={index} value={tab.id}>{tab.name}</Tab>
                        ))}
                    </TabList>
                    <div className="flex justify-center py-2">
                        <Button className={mergeClasses("flex flex-shrink")}
                            onClick={() => {
                                dispatchPaper({ type: "UNFOCUS_PAPER" });
                            }} icon={<DismissRegular />} size="small" appearance="subtle" />
                    </div>
                </div>
                <div className="flex flex-grow">
                    <DetailsPanel />
                </div>
            </aside>
        );
    } else {
        return null;
    }
}

