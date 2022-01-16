import { DocumentType } from "@typegoose/typegoose";
import { UserInputError } from "apollo-server-core";
import {
    Arg,
    Authorized,
    Ctx,
    Field,
    InputType,
    Mutation,
    ObjectType,
    Query,
    Resolver,
    UnauthorizedError,
} from "type-graphql";
import { User, UserModel } from "../model/user";
import { AuthorizedContext, TokenCache } from "./auth";

@InputType()
class NewUserInput {
    @Field()
    username!: string;

    @Field()
    password!: string;

    balance: number = 0;
}

@ObjectType()
class AuthorizedUser {
    @Field(() => User)
    public user!: User;

    @Field()
    public token!: string;

    constructor(user: User, token: string) {
        this.user = user;
        this.token = token;
    }
}

@Resolver()
export class UserResolver {
    @Query(() => User)
    async user(@Arg("id") id: string): Promise<DocumentType<User>> {
        const user = await UserModel.findById(id);

        if (!user) {
            throw new UserInputError("User not found");
        }

        return user;
    }

    @Authorized()
    @Mutation(() => Boolean)
    async logout(@Ctx() ctx: AuthorizedContext): Promise<boolean> {
        try {
            TokenCache.delete(ctx.token);
        } catch (ex) {
            console.log(ex);
            return false;
        }
        return true;
    }

    @Mutation(() => AuthorizedUser)
    async login(
        @Arg("username") username: string,
        @Arg("password") password: string
    ): Promise<AuthorizedUser> {
        try {
            const user = await UserModel.findByPassword(username, password);
            const token = await User.generateToken(user);

            TokenCache.set(token, user);
            return new AuthorizedUser(user, token);
        } catch (ex) {
            console.log(ex);
            throw new UnauthorizedError();
        }
    }

    @Mutation(() => AuthorizedUser)
    async newUser(@Arg("newUserData") user: NewUserInput): Promise<AuthorizedUser> {
        const newUser = new UserModel(user);
        await newUser.save();

        const token = await User.generateToken(newUser);
        TokenCache.set(token, newUser);

        return new AuthorizedUser(newUser, token);
    }

    @Authorized()
    @Mutation(() => AuthorizedUser)
    async addBalance(@Ctx() ctx: AuthorizedContext, @Arg("value") value: number) {
        ctx.user.balance += value;
        await ctx.user.save();
        return new AuthorizedUser(ctx.user, ctx.token);
    }
}
