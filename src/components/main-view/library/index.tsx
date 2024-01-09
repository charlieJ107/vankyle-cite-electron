import { SelectTabData, SelectTabEvent, Tab, TabList, TabValue, mergeClasses } from "@fluentui/react-components";
import PapersList from "./papers";
import { useState } from "react";
import { BlockTab } from "@components/contexts/tabs/tabs-context-types";


export default function Library({ className }: { className?: string }) {
    const tabs: BlockTab[] = [
        {
            id: "library",
            name: "Library",
        }
    ]; // TODO: Dynamically generate tabs
    const [tab, setTab] = useState<TabValue>(tabs[0].id);
    const onTabSelect = (_event: SelectTabEvent, data: SelectTabData) => {
        setTab(data.value);
    };
    return (
        <section className={mergeClasses(className, "flex flex-col flex-grow rounded my-2 p-2")}>
            <div className="flex flex-row mb-3 justify-between">
                <TabList selectedValue={tab}
                    defaultSelectedValue={tab}
                    onTabSelect={onTabSelect}>
                    {tabs.map((tab, index) => (
                        <Tab key={index} value={tab.id}>{tab.name}</Tab>
                    ))}
                </TabList>
            </div>
            <PapersList />
        </section>
    );
}