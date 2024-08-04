import mongoose from "mongoose";


mongoose.set('strictQuery', true);
const connectDB = async () => {
  try {
    const conn = mongoose.connect(process.env.MONGO_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });

    console.log(`Database connected`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB