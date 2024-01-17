import "vankyle-cite-types";
import { Paper } from "vankyle-cite-types";
import { HandlerBase } from "./handlers/HandlerBase";

const handlers = [] as HandlerBase[];

function main(_filePaths: string[]): Paper[] {
  const papers = [] as Paper[];
  for (const filePath of _filePaths) {
    let paper = {} as Paper;
    for (const handler of handlers) {
      if (handler.isValidDrop(filePath)) {
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