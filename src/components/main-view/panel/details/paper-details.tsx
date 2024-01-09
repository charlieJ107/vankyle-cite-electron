import { Subtitle1, Text, Title1 } from "@fluentui/react-components";
import { Paper } from "@models/paper";

export function PaperDetails({ paper }: { paper: Paper }) {
    return (
        <article className="container bg-gray-100 p-2">
            <Title1 block >{paper.title}</Title1>
            <Subtitle1 block className="mt-3">Authors</Subtitle1>
            <div className="flex flex-row flex-wrap mt-1">
                {paper.authors.map((author, index) => (
                    <Text className="p-2 mx-1 bg-white hover:bg-gray-300" key={index}>{typeof author === "string" ? author : author.name}</Text>
                ))}
            </div>
            <Subtitle1 block className="mt-3">Publisher</Subtitle1>
        </article>
    );
} 