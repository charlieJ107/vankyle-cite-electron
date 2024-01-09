import { Card, CardHeader, makeStyles, mergeClasses, tokens, typographyStyles } from "@fluentui/react-components";
import { Paper } from "@models/paper";
import { usePaperDispatch } from "@components/contexts/papers/paper-context";

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
    const dispatch = usePaperDispatch();
    const onFucusPaper = () => {
        dispatch({
            type: "FOCUS_PAPER",
            paper: paper
        });
    }
    return (
        <Card focusMode="no-tab" className={mergeClasses(style.root, "m-2")} onClick={onFucusPaper} >
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
    const authors_name = paper.authors.map((author) => {
        if (typeof author === "string") {
            return author;
        } else {
            return author.name;
        }
    })
    return (
        <div>
            <p className={mergeClasses(style.authors)}>
                {authors_name.join(", ")}
            </p>
            <p className={mergeClasses(style.description)}>
                <span>
                    {paper.publishTime?.getFullYear()}
                </span>
                &nbsp; | &nbsp;
                <span>
                    {paper.description}
                </span>
            </p>
        </div>
    );
}