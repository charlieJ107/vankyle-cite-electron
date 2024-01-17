import { useState } from "react";
import { BlockTab } from "../../../contexts/tabs/tabs-context-types";
import { SelectTabData, SelectTabEvent, Tab, TabList, TabValue, mergeClasses } from "@fluentui/react-components";
import { PapersExploer } from "./papers-exploer";


export function Exploer() {
    const tabs: BlockTab[] = [
        {
            id: "repository",
            name: "Repository",
            TabComponent: <PapersExploer />
        }
    ]; // TODO: Dynamically generate tabs
    const [tab, setTab] = useState<TabValue>(tabs[0].id);
    const onTabSelect = (_event: SelectTabEvent, data: SelectTabData) => {
        setTab(data.value);
    };
    return (
        <div className="w-56">
            <div className="flex flex-row mb-3 justify-between">
                <TabList className={mergeClasses("flex")}
                    defaultSelectedValue={tab}
                    selectedValue={tab}
                    onTabSelect={onTabSelect}>
                    {tabs.map((tab, index) => (
                        <Tab key={index} value={tab.id}>{tab.name}</Tab>
                    ))}
                </TabList>
            </div>
            {tabs[tabs.findIndex((activateTab) => activateTab.id === tab)].TabComponent}
        </div>
    );
}