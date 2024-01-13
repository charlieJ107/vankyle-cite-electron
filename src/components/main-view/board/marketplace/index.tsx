import { IPlugin, PluginManifest } from "@/plugins/PluginManifest";
import { useEffect, useState } from "react";
import { InstalledPluginItem } from "./installed-plugin-item";
import { Title3 } from "@fluentui/react-components";

export function Marketplace() {
    const [plugins, setPlugins] = useState<IPlugin[]>([]);
    useEffect(() => {
        window.App.Services.PluginManager.getInstalledPlugins().then((plugins) => {
            setPlugins(plugins);
        });
    }, []);

    const onEnablePlugin = (plugin: PluginManifest) => {
        window.App.Services.PluginManager.enablePlugin(plugin).then(() => {
            window.App.Services.PluginManager.getInstalledPlugins().then((newPlugins) => {
                setPlugins(newPlugins);
            });
        });

    }

    const onDisablePlugin = (plugin: PluginManifest) => {
        window.App.Services.PluginManager.disablePlugin(plugin).then(() => {
            window.App.Services.PluginManager.getInstalledPlugins().then((newPlugins) => {
                setPlugins(newPlugins);
            });
        });

    }

    return (
        <div className="w-56">
            <Title3>Installed Plugins</Title3>
            {plugins.map((plugin, index) =>
                <InstalledPluginItem
                    key={index} plugin={plugin}
                    onEnable={onEnablePlugin}
                    onDisable={onDisablePlugin} />)}
        </div>
    );
}