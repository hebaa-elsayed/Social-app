import { GraphQLString, GraphQLInt, GraphQLObjectType } from "graphql";



export const sayHelloType = new GraphQLObjectType({
    name: 'SayHello',
    fields: {
        name: { type: GraphQLString , description: 'Name of the person' },
        age: { type: GraphQLInt },
    }
})