import "vankyle-cite-types";
import { Paper } from "vankyle-cite-types";
export function main(filePaths: string[]): Paper[] {
  // do something with paper
  return [] as Paper[];
}


window.App.Services.DropService.registerDropHandler(main);