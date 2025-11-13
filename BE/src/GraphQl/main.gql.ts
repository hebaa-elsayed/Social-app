import { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLNonNull } from "graphql";
import UserQuery from "./Schema/Query/user.query";


export const MainSchema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: 'QueryMainSchema',
        description: 'This is the query main schema',
        fields: {
            ...UserQuery.register()
        }
    }),
    mutation: new GraphQLObjectType({
        name: 'MutationMainSchema',
        description: 'This is the mutation main schema',
        fields: {
            mutationHello: {
                type: GraphQLInt,
                resolve: () => {
                    return 100000}
            }
        }
    })
})