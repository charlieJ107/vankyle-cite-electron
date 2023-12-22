import { Tab, TabList, mergeClasses } from "@fluentui/react-components";
import { useState } from "react";
import { DetailsPanel } from "./details";


export default function Panel({ className }: { className?: string }) {

    const [tab, setTab] = useState<"details" | "related">("details");
    // TODO: Details panel or related panel or others
    return (
        <aside className={mergeClasses(className, "flex flex-col m-3 rounded p-3")}>
            <TabList className={mergeClasses("flex")}>
                <Tab value={"details"}>Details</Tab>
                <Tab value={"related"}>Related</Tab>
            </TabList>
            <div className="flex flex-grow">
                {tab === "details" && <DetailsPanel />}
                {tab === "related" && <div>Related</div>}
            </div>
        </aside>
    );

}

