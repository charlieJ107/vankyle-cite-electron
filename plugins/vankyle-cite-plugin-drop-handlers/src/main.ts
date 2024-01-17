import "vankyle-cite-types";
import { Paper } from "vankyle-cite-types";
import { HandlerBase } from "./handlers/HandlerBase";
import { PdfDropHandler } from "./handlers/PdfDropHandler";

const handlers = [
  new PdfDropHandler(),
] as HandlerBase[];

async function main(filePaths: string[]): Promise<Paper[]> {
  console.log("main", filePaths);
  const papers = [] as Paper[];
  for (const filePath of filePaths) {
    let paper = {} as Paper;
    for (const handler of handlers) {
      if (handler.isSupport(filePath)) {
        // TODO: optimize async
        paper = await handler.handleDrop(filePath).then((result) => {
          return {
            ...paper,
            ...result,
          };
        });
      }
    }
    console.log("paper", paper);
    papers.push(paper);
  }
  return papers;
}


window.App.Services.DropService.registerDropHandler(main);
