import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config();
dotenv.config({ path: "./src/.env" });

const MongoDBConnect = async () =>{
    try{
        await mongoose.connect(process.env.MONGO_URI)
       
        console.log("Connected to MongoDB");
    }catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }

}

export default MongoDBConnect;