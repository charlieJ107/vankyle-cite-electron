import { Input, makeStyles, mergeClasses, tokens } from "@fluentui/react-components";
import { Search12Regular } from "@fluentui/react-icons";

export const useStyle = makeStyles({
    header: {
        backgroundColor: tokens.colorBrandBackground
    },
});

export default function Header() {
    const style = useStyle();
    return (
        <header id="app-header" className={mergeClasses(style.header, "flex justify-center rouded")}>
            <Input className="w-1/2 my-2"
                placeholder="Search"
                contentBefore={<Search12Regular />} />
        </header>
    );
}