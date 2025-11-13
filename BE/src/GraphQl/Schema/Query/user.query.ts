import { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLNonNull } from "graphql";
import { sayHelloType } from "../../Types/user.types";
import { sayHelloArgsType } from "../../Args/user.args";
import UserResolver from "../../Resolvers/user.resolvrs";


class UserQuery {
    private userResolver: UserResolver = new UserResolver()
    register() {
        return{
             sayHello: {
                        type: sayHelloType,
                        args: sayHelloArgsType,
                        resolve: this.userResolver.sayHello
                        }
        }
    }
}

export default new UserQuery()
