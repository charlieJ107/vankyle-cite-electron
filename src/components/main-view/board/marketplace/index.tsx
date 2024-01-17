import { IPlugin, PluginManifest } from "../../../../plugins/PluginManifest";
import { useEffect, useState } from "react";
import { InstalledPluginItem } from "./installed-plugin-item";
import { Body1Strong, Divider, Subtitle2, Text, makeStyles, mergeClasses, shorthands, tokens } from "@fluentui/react-components";

const useStyle = makeStyles({
    titleDivider: {
        "::before": {
            ...shorthands.borderColor(tokens.colorBrandStroke1),
            borderEndStartRadius: tokens.borderRadiusMedium,
            borderStartStartRadius: tokens.borderRadiusMedium,
            marginBottom: tokens.spacingVerticalL,
            marginTop: tokens.spacingVerticalS,
            borderTopWidth: tokens.strokeWidthThicker
        },
        "::after": {
            ...shorthands.borderColor(tokens.colorBrandStroke1),
            borderEndEndRadius: tokens.borderRadiusMedium,
            borderStartEndRadius: tokens.borderRadiusMedium,
            marginBottom: tokens.spacingVerticalL,
            marginTop: tokens.spacingVerticalS,
            borderTopWidth: tokens.strokeWidthThicker
        }
    }
});

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
    const styles = useStyle();
    return (
        <div className="w-56 mt-3">
            <div className="max-w-fit">
                <Body1Strong>Installed Plugins</Body1Strong>
                <Divider appearance="brand" className={styles.titleDivider} />
            </div>
            {plugins.map((plugin, index) =>
                <InstalledPluginItem
                    key={index} plugin={plugin}
                    onEnable={onEnablePlugin}
                    onDisable={onDisablePlugin} />)}
        </div>
    );
}