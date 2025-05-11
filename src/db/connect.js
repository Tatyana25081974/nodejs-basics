import { MongoClient } from 'mongodb';
const url = 'mongodb+srv://tatyanakorabelnikovamama:jwVv2Gzqi0aVQebO@cluster0.yfw8mwo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(url);
export async function connectDB() {
  try {
    await client.connect();
    console.log('🟢 Успішне зʼєднання з MongoDB Atlas');
  } catch (error) {
    console.error('❌ Помилка підключення:', error.message);
  }
}