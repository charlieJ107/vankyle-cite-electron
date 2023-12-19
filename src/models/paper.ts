export interface Paper {
    title: string;
    date: Date;
    description: string;
}

export const _dummyPapersForDev = [
    // Generate dummy 3 papers for development
    {
        title: "Paper 1",
        date: new Date(),
        description: "This is a paper 1"
    },
    {
        title: "Paper 2",
        date: new Date(),
        description: "This is a paper 2"
    },
    {
        title: "Paper 3",
        date: new Date(),
        description: "This is a paper 3"
    }
];