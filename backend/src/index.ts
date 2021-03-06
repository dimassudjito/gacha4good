import { mongoose } from "@typegoose/typegoose";
import { ApolloServer } from "apollo-server";
import dotenv from "dotenv";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { BoxingGameResolver } from "./service/game";
import { UserResolver } from "./service/user";

dotenv.config();
const PORT = process.env.PORT || 5555;

async function startServer() {
    const schema = await buildSchema({
        resolvers: [UserResolver, BoxingGameResolver],
        emitSchemaFile: true,
    });

    const server = new ApolloServer({
        schema,
    });

    const { url } = await server.listen(PORT);
    console.log(`Server is running, GraphQL Playground available at ${url}`);
}

mongoose
    .connect(
        "mongodb+srv://gacha4good:verygood@cluster0.bpxxb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
    )
    .then(async () => {
        await startServer();
    })
    .catch((err) => {
        console.error(err);
    });
