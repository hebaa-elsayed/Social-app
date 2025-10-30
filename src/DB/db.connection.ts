import mongoose from "mongoose";


export async function dbConnection () {
    try {
        await mongoose.connect(process.env.DB_URL_LOCAL as string)
        console.log("Database connected Successfully");
    } catch (error) {
        console.log(`Error connecting to the database: ${error}`);
        
    }
}