import "vankyle-cite-types";
import { Paper } from "vankyle-cite-types";
export function main(paper: Paper): void {
  // do something with paper
}


window.App.Services.DropService.registerDopeHandler("vankyle-cite-plugin-scrappers", main);