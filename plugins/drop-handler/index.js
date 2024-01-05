window.AppServices.PaperService.getAllPapers().then(papers => {
    console.log(papers);
});

window.AppServices.DropService.registerDropHandler("drop-handler", (dropData) => {
        console.log(dropData);
    });