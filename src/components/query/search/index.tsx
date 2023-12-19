import { Textarea } from "@fluentui/react-components";

export default function Search() {
    return (
        <div className="flex flex-col m-3 h-1/2">
            <Textarea placeholder="Ask AI about your papers" />
        </div>
    );
}