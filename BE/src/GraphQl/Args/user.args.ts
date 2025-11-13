import { GraphQLInt, GraphQLString } from "graphql";



export const sayHelloArgsType = {
    name: { type: GraphQLString , description: 'Name of the person' },
    age: { type: GraphQLInt },
}