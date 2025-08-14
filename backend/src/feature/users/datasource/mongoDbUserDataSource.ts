import { Db, MongoClient, ObjectId } from "mongodb";
import { CreateUser, UpdateUser, IUser, IMongoUser, IUpdateMongoUser } from "./models/user";
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
    const coll = db.collection<IUser>('users');
    const response = await coll.insertOne(user as IUser);
    if(!response.acknowledged || !response.insertedId) {
      throw new DatabaseError('Error creating new user')
    }
    (user as IUser)._id = response.insertedId;
    return user as IUser;
  };
  async getUser(userId: string) {
    const db = this.connect();
    const coll = db.collection<IMongoUser>('users');
    const user = await coll.findOne({'_id': new ObjectId(userId)});
    if(!user) {
      throw new NotFoundError(`User with id: ${userId} not found`)
    }

    return this.toIUser(user);
  }
  async getUserByAuthId(auth0_id: string) {
    const db = this.connect()
    const coll = db.collection<IMongoUser>('users');
    let user = await coll.findOne({auth0_id});
    if(!user) {
      throw new DatabaseError(`User with auth0_id ${auth0_id} not found`)
    }
    return this.toIUser(user);
  }
  async updateUser(userId: string, user: UpdateUser) {
    const db = this.connect();
    const coll = db.collection<IUpdateMongoUser>('users');
    const result = await coll.updateOne({'_id': new ObjectId(userId)}, { $set: this.toIMongoUser(user)});
    if(!result.acknowledged || result.modifiedCount !== 1) {
      throw new DatabaseError(`An error occured updating user with id: ${userId}`)
    }
    return result.modifiedCount;
  }
  async deleteUser(userId: string) {
    const db = this.connect();
    const coll = db.collection<IMongoUser>('users');
    const res = await coll.deleteOne({'_id': new ObjectId(userId)});
    if(!res.acknowledged || res.deletedCount !== 1) {
      throw new DatabaseError(`An error occured deleting user with id: ${userId}`)
    }
    return res.deletedCount;
  }
  private connect() {
    try {
      if(!this.db) {
        console.log("Connecting to db...")
        this.db = this.client.db(config.dbName)
      }
      return this.db
    } catch(err) {
      throw new DatabaseError(err?.message ?? 'Error connecting to the database')
    }
  }
  private toIUser(mongoUser: IMongoUser) {
    const user: IUser = { 
      ...mongoUser,
      _id: mongoUser._id.toString(),
      puzzlesPlayed: mongoUser.puzzlesPlayed.map(each => each.toString()),
      currentPuzzle: {...mongoUser.currentPuzzle, _id: mongoUser.currentPuzzle?._id.toString()}
    }
    return user;
  }
  private toIMongoUser(user: UpdateUser) {
    const mongoUser = (user.puzzlesPlayed !== undefined || user.puzzlesPlayed?.length > 0) ? {...user, puzzlesPlayed: user.puzzlesPlayed.map(each => new ObjectId(each))} : {...user}
    return mongoUser as IUpdateMongoUser
  }
}
