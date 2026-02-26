import mongoose from 'mongoose'
import { config } from '../config/index.js'

export async function connectMongo() {
  await mongoose.connect(config.mongodbUri)
}
