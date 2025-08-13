import { Db, MongoClient, ObjectId } from "mongodb";
import { CreateUser, UpdateUser, MongoUser } from "./models/user";
import { UserDataSource } from "./userDataSource";
import { config } from "@/core/config";
import { DatabaseError } from "@/core/errors/databaseError";
import { NotFoundError } from "@/core/errors/notFoundError";

export class MongoDbUserDataSource implements UserDataSource {
  static instance: MongoDbUserDataSource | null = null;
  private client: MongoClient;
  private db: Db | null = null;
  constructor(client: MongoClient) {
    this.client = client;
  } 
  static create(client: MongoClient) {
    if(MongoDbUserDataSource.instance === null) {
      MongoDbUserDataSource.instance = new MongoDbUserDataSource(client);
    }
    return MongoDbUserDataSource.instance;
  }
  async createUser(user: CreateUser) {
    const db = this.connect();
    const coll = db.collection<MongoUser>('users');
    const response = await coll.insertOne(user as MongoUser);
    if(!response.acknowledged || !response.insertedId) {
      throw new DatabaseError('Error creating new user')
    }
    (user as MongoUser)._id = response.insertedId;
    return user as MongoUser;
  };
  async getUser(userId: string) {
    const db = this.connect();
    const coll = db.collection<MongoUser>('users');
    const user = await coll.findOne({'_id': new ObjectId(userId)});
    if(!user) {
      throw new NotFoundError(`User with id: ${userId} not found`)
    }
    return user;
  }
  async getUserByAuthId(auth0_id: string) {
    const db = this.connect()
    const coll = db.collection<MongoUser>('users');
    let user = await coll.findOne({auth0_id});
    if(!user) {
      throw new DatabaseError(`User with auth0_id ${auth0_id} not found`)
    }
    return user;
  }
  async updateUser(userId: string, user: UpdateUser) {
    const db = this.connect();
    const coll = db.collection<MongoUser>('users');
    console.log(user)
    const result = await coll.updateOne({'_id': new ObjectId(userId)}, { $set: {...user}});
    if(!result.acknowledged || result.modifiedCount !== 1) {
      throw new DatabaseError(`An error occured updating user with id: ${userId}`)
    }
    return result.modifiedCount;
  }
  async deleteUser(userId: string) {
    const db = this.connect();
    const coll = db.collection<MongoUser>('users');
    const res = await coll.deleteOne({'_id': new ObjectId(userId)});
    if(!res.acknowledged || res.deletedCount !== 1) {
      throw new DatabaseError(`An error occured deleting user with id: ${userId}`)
    }
    return res.deletedCount;
  }
  private connect() {
    try {
      if(!this.db) {
        this.db = this.client.db(config.dbName)
      }
      return this.db
    } catch(err) {
      throw new DatabaseError(err?.message ?? 'Error connecting to the database')
    }
  }
}
