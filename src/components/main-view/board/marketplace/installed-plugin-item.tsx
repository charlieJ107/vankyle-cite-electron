import { IPlugin, PluginManifest } from "@/plugins/PluginManifest";
import { Button, Card, CardFooter, CardHeader } from "@fluentui/react-components";
import { AppsAddInRegular, MoreHorizontalRegular } from "@fluentui/react-icons";

export function InstalledPluginItem({ plugin, onEnable, onDisable }: { plugin: IPlugin, onEnable: (plugin: PluginManifest) => void, onDisable: (plugin: PluginManifest) => void }) {
    return (
        <Card className="my-2">
            <CardHeader
                image={plugin.manifest.icon ? plugin.manifest.icon : <AppsAddInRegular />}
                header={plugin.manifest.displayName || plugin.manifest.name}
                action={
                    <Button icon={<MoreHorizontalRegular />}>
                        {/* TODO: Menu */}
                    </Button>
                }
            />
            <p>{plugin.manifest.description}</p>
            <CardFooter>
                {plugin.status === "enabled" ?
                    <Button onClick={() => onDisable(plugin.manifest)}>
                        Disable
                    </Button> :
                    <Button onClick={() => onEnable(plugin.manifest)}>
                        Enable
                    </Button>}
            </CardFooter>
        </Card>
    );
}