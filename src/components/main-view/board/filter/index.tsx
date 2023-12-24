import { useState } from "react";
import { BlockTab } from "../../../../contexts/tabs/tabs-context-types";
import { Button, SelectTabData, SelectTabEvent, Tab, TabList, TabValue, mergeClasses } from "@fluentui/react-components";
import { DismissRegular } from "@fluentui/react-icons";

export function FilterBoard() {
    const tabs: BlockTab[] = [
        {
            id: "repository",
            name: "Repository",
        }
    ]; // TODO: Dynamically generate tabs
    const [tab, setTab] = useState<TabValue>(tabs[0].id);
    const onTabSelect = (_event: SelectTabEvent, data: SelectTabData) => {
        setTab(data.value);
    };

    return (
        <div>
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
                <div className="flex justify-center py-2">
                    <Button className={mergeClasses("flex flex-shrink")}
                        onClick={() => {

                        }} size="small"
                        icon={<DismissRegular />}
                        appearance="subtle" />
                </div>
            </div>
        </div>
    );
}