import { DocumentType, Ref } from "@typegoose/typegoose";
import { ApolloError, UserInputError } from "apollo-server";
import {
    Arg,
    Field,
    FieldResolver,
    InputType,
    Int,
    Maybe,
    Mutation,
    Query,
    Resolver,
    Root,
} from "type-graphql";
import { BoxingCard, BoxingCardModel, BoxingCardPack, BoxingCardPackModel } from "../model/game";
import { UserModel } from "../model/user";

const randBetween = (min: number, max: number) => {
    return Math.random() * (max - min) + min;
};

@InputType()
export class NewBoxingCard {
    @Field()
    public name!: string;

    @Field(() => Int)
    public healthPoints!: number;

    @Field(() => Int)
    public attackPower!: number;

    @Field()
    public cardPicture!: string;

    @Field()
    public headPicture!: string;
}

@Resolver(BoxingCardPack)
export class BoxingGameResolver {
    @Query(() => [BoxingCardPack])
    async packs(): Promise<Maybe<Array<BoxingCardPack>>> {
        return await BoxingCardPackModel.find();
    }

    @Mutation(() => BoxingCard)
    async buyPack(
        @Arg("userId") userId: string,
        @Arg("packId") packId: string
    ): Promise<DocumentType<BoxingCard>> {
        const cardPack = await BoxingCardPackModel.findById(packId);
        const user = await UserModel.findById(userId);

        if (!cardPack) {
            throw new UserInputError("Invalid packId");
        }

        if (user.balance - cardPack.price < 0) {
            throw new UserInputError("Can't afford card");
        }

        const weights = Array.from(cardPack.cards, (pair) => pair.rate);

        let sum = 0;
        const prefixSum = weights.map<number>((x) => (sum = sum + x));

        const value = randBetween(0, prefixSum.at(-1));
        const index = prefixSum.findIndex((arrayValue) => {
            return arrayValue > value;
        });

        let cardRef: Ref<BoxingCard>;

        if (index === -1) {
            cardRef = cardPack.cards.at(index).card;
        } else if (index === 0) {
            cardRef = cardPack.cards.at(0).card;
        } else {
            cardRef = cardPack.cards.at(index - 1).card;
        }

        user.addCard(cardRef);

        const card = await BoxingCardModel.findById(cardRef);

        if (!card) {
            throw new ApolloError("Card not found");
        }

        return card;
    }

    @Mutation(() => BoxingCard)
    async createBoxer(@Arg("boxerData") data: NewBoxingCard): Promise<DocumentType<BoxingCard>> {
        const newCard = new BoxingCardModel(data);
        await newCard.save();

        return newCard;
    }

    @FieldResolver()
    async cards(
        @Root() pack: DocumentType<BoxingCardPack>
    ): Promise<Array<DocumentType<BoxingCard>>> {
        const cardPromises = pack.cards.map((cardRef) => {
            return BoxingCardModel.findById(cardRef.card);
        });

        const resolvedCards = await Promise.all(cardPromises);

        return resolvedCards;
    }
}
