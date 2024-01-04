import { IPlugin, PluginManifest } from "@/plugins/PluginManifest";
import { useEffect, useState } from "react";
import { InstalledPluginItem } from "./installed-plugin-item";
import { Title3 } from "@fluentui/react-components";

export function Marketplace() {
    const [plugins, setPlugins] = useState<IPlugin[]>([]);
    useEffect(() => {
        window.AppServices.PluginService.getPlugins().then((plugins) => {
            setPlugins(plugins);
        });
        console.log(plugins);
    }, []);
    return (
        <div className="w-56">
            <Title3>Installed Plugins</Title3>
            {plugins.map((plugin, index) => <InstalledPluginItem key={index} plugin={plugin} />)}
        </div>
    );
}