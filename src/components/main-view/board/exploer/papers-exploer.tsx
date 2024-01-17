import { Divider, SelectTabData, SelectTabEvent, Tab, TabList, TabValue, mergeClasses } from "@fluentui/react-components";
import { useState } from "react";
import { BlockTab } from "../../../contexts/tabs/tabs-context-types";

export function PapersExploer() {
    const tabs: BlockTab[] = [
        {
            id: "all-papers",
            name: "All Papers",
        },
        {
            id: "flagged-papers",
            name: "Flagged Papers",
        }
    ]; // TODO: Dynamically generate tabs
    const [tab, setTab] = useState<TabValue>(tabs[0].id);
    const onTabSelect = (_event: SelectTabEvent, data: SelectTabData) => {
        setTab(data.value);
    };
    return (
        <div className="mt-5 mx-2">
            <div className="flex flex-row mb-3 justify-between">
                <TabList className={mergeClasses("flex")}
                    defaultSelectedValue={tab}
                    selectedValue={tab}
                    onTabSelect={onTabSelect}
                    vertical>
                    {tabs.map((tab, index) => (
                        <Tab key={index} value={tab.id}>{tab.name}</Tab>
                    ))}
                </TabList>
            </div>
            <Divider className="w-full" />
            {/* TODO: Tags and Groups  */}
        </div>
    );
}