import { Subtitle1, Text, Title2 } from "@fluentui/react-components";
import { Paper } from "../../../models/paper";

export function PaperDetails({ paper }: { paper: Paper }) {
    return (
        <article className="container bg-gray-100 p-2">
            <Title2 block >{paper.title}</Title2>
            <Subtitle1 block >Authors</Subtitle1>
            <div className="flex flex-row flex-wrap">
                {paper.authors.map((author, index) => (
                    <Text className="m-2 p-2 hover:bg-white" key={index}>{author.name}</Text>
                ))}
            </div>
            <Subtitle1 block >Publisher</Subtitle1>
        </article>
    );
}