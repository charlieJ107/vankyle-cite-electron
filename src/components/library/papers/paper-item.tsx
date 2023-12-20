import { Card, CardHeader, makeStyles, mergeClasses, tokens, typographyStyles } from "@fluentui/react-components";
import { Paper } from "../../../models/paper";

const usePaperItemStyle = makeStyles({
    root: {
        ":hover": {
            backgroundColor: tokens.colorNeutralBackground1Hover
        }
    },
    header: {
        ...typographyStyles.title3
    },
    authors: {
        ...typographyStyles.body1
    },
    description: {
        ...typographyStyles.caption1
    }
});

export default function PaperItem({ paper }: { paper: Paper }) {
    const style = usePaperItemStyle();
    return (
        <Card focusMode="no-tab" className={mergeClasses(style.root, "m-2")}>
            <CardHeader header={<PaperHeader paper={paper} />}
                description={<PaperDetails paper={paper} />}>
            </CardHeader>
        </Card>
    );
}

function PaperHeader({ paper }: { paper: Paper }) {
    const style = usePaperItemStyle();
    return (
        <h2 className={mergeClasses(style.header)}>
            {paper.title}
        </h2>
    );
}

function PaperDetails({ paper }: { paper: Paper }) {
    const style = usePaperItemStyle();
    return (
        <div>
            <p className={mergeClasses(style.authors)}>
                {paper.authors.join(", ")}
            </p>
            <p className={mergeClasses(style.description)}>
                <span>
                    {paper.date.getFullYear()}
                </span>
                &nbsp; | &nbsp;
                <span>
                    {paper.description}
                </span>
            </p>
        </div>
    );
}