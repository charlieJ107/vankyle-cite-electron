import { Input, mergeClasses, InteractionTagPrimary, InteractionTag } from "@fluentui/react-components";

export default function Tags() {
    const tags = ["tag1", "some-long-tag", "long-tag", "some-very-long tag, and some more text even more", "tag5", "tag6", "tag7", "tag8"];
    return (
        <div className={mergeClasses("flex flex-grow flex-col m-3 max-w-80")}>
            <Input className={mergeClasses("")} placeholder="Search a tag" />
            <div className="flex m-2 flex-wrap">
                {tags.map((tag: string, index: number) => (
                    // TODO: Handle very long tags
                    <InteractionTag key={index} className="m-1">
                        <InteractionTagPrimary>
                            {tag}
                        </InteractionTagPrimary>
                    </InteractionTag>
                ))}
            </div>
        </div>
    );
}