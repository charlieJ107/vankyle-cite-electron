import { Textarea } from "@fluentui/react-components";

export default function Search() {
    return (
        <div className="flex flex-grow flex-col m-3 max-w-80">
            <Textarea className="" placeholder="Ask AI about your papers" />
        </div>
    );
}