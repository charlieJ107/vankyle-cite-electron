import { Paper } from "../../../models/paper";

export default function PaperItem({ paper }: { paper: Paper }) {
    return (
        <article className="">
            <h2>{paper.title}</h2>
            <p>{paper.date.getFullYear()}</p>
        </article>
    );
}