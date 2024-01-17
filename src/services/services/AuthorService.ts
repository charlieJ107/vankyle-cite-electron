import { IDatabase } from "src/data/database/IDatabase";
import { Author } from "src/models/author";

export class AuthorService {
    private database: IDatabase<Author>;
    constructor(database: IDatabase<Author>) {
        this.database = database;
    }

    public async addAuthor(author: Partial<Author>): Promise<Author> {
        return await this.database.save(author);
    }

    public async findAuthorByName(firstName: string, lastName: string): Promise<Author | null> {
        const authors = await this.database.getList((author) => {
            if (typeof author.name === "object") {
                return author.name.firstName === firstName && author.name.lastName === lastName;
            } else if (typeof author.name === "string") {
                return author.name === `${firstName} ${lastName}`;
            }
            return false;
        });
        if (authors.length === 0) {
            return null;
        }
        return authors[0];
    }

}