import "vankyle-cite-types";
import { Paper } from "vankyle-cite-types";
import { HandlerBase } from "./handlers/HandlerBase";
import { PdfDropHandler } from "./handlers/PdfDropHandler";

const handlers = [
  new PdfDropHandler(),
] as HandlerBase[];

function main(filePaths: string[]): Paper[] {
  console.log("main", filePaths);
  const papers = [] as Paper[];
  for (const filePath of filePaths) {
    let paper = {} as Paper;
    for (const handler of handlers) {
      if (handler.isSupport(filePath)) {
        const handleResult = handler.handleDrop(filePath);
        paper = {
          ...paper,
          ...handleResult,
        };
      }
    }
    papers.push(paper);
  }
  return papers;
}


window.App.Services.DropService.registerDropHandler(main);
