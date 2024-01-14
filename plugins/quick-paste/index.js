console.log("quick-paste")
window.App.Service.PluginManager.getInstalledPlugins().then((plugins) => {
    console.log(plugins)
})