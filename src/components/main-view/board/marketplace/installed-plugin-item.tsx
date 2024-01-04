import { IPlugin } from "@/plugins/PluginManifest";
import { Button, Card, CardFooter, CardHeader } from "@fluentui/react-components";
import { AppsAddInRegular, MoreHorizontalRegular } from "@fluentui/react-icons";

export function InstalledPluginItem({ plugin }: { plugin: IPlugin }) {
    return (
        <Card>
            <CardHeader
                image={plugin.manifest.icon ? plugin.manifest.icon : <AppsAddInRegular />}
                header={plugin.manifest.name}
                action={
                    <Button icon={<MoreHorizontalRegular />}>
                        {/* TODO: Menu */}
                    </Button>
                }
            />
            <p>{plugin.manifest.description}</p>
            <CardFooter>
                {plugin.status === "enabled" ?
                    <Button>
                        Disable
                    </Button> :
                    <Button onClick={() => window.AppServices.PluginService.enablePlugin(plugin.manifest)}>
                        Enable
                    </Button>}
            </CardFooter>
        </Card>
    );
}