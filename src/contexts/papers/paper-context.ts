import { PaperContextType } from "./paper-context-types";

const _dummyPapersForDev = [
    // Generate dummy 3 papers for development
    {
        title: "Paper 1",
        date: new Date(),
        description: "This is a paper 1",
        authors: ["Author 1", "Author 2"]
    },
    {
        title: "Paper 2",
        date: new Date(),
        description: "This is a paper 2",
        authors: ["Author 1", "Author 2"]
    },
    {
        title: "Paper 3",
        date: new Date(),
        description: "This is a paper 3",
        authors: ["Author 1", "Author 2"]
    }
];

export const InitialPaperContext: PaperContextType = {
    filteredPapers: _dummyPapersForDev, // TODO: get from server
    selectedPapers: [],
    focusedPaper: null
};


