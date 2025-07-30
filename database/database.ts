import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

import { defineAuthModel } from './models/auth.ts';
import { defineUserModel } from './models/user.ts';
import { defineStoryModel } from './models/story.ts';
import { defineCommentModel } from './models/comment.ts';
import { defineLikeModel } from './models/like.ts';
dotenv.config();

export const sequelize = new Sequelize(
  process.env.DB_NAME as string,
  process.env.DB_USER as string,
  process.env.DB_PASSWORD as string,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT as any,
  },
);

export const User = defineUserModel(sequelize);
export const Auth = defineAuthModel(sequelize);
export const Story = defineStoryModel(sequelize);
export const Comment = defineCommentModel(sequelize);
export const Like = defineLikeModel(sequelize);

export const applyAssociation = () => {
  User.hasOne(Auth, { foreignKey: 'userId', as: 'auth', onDelete: 'CASCADE' });
  Auth.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  User.hasMany(Story, {
    foreignKey: 'authorId',
    as: 'story',
    onDelete: 'CASCADE',
  });

  Story.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

  Story.hasMany(Comment, {
    foreignKey: 'storyId',
    as: 'comment',
    onDelete: 'CASCADE',
  });

  Comment.belongsTo(Story, { foreignKey: 'storyId', as: 'story' });

  User.hasMany(Comment, {
    foreignKey: 'userId',
    as: 'comment',
    onDelete: 'CASCADE',
  });
  Comment.belongsTo(User, { foreignKey: 'userId', as: 'author' });

  User.hasMany(Like, {
    foreignKey: 'userId',
    as: 'likes',
    onDelete: 'CASCADE',
  });
  Like.belongsTo(User, { foreignKey: 'userId' });

  Story.hasMany(Like, {
    foreignKey: 'storyId',
    as: 'likes',
    onDelete: 'CASCADE',
  });

  Like.belongsTo(Story, { foreignKey: 'storyId' });
};

export const initDatabase = async () => {
  try {
    applyAssociation();
    // await sequelize.sync({ alter: true });
    await sequelize.authenticate();
    console.log('  DB connection established!');
  } catch (err) {
    console.error('  Unable to connect to the DB:', err);
    process.exit(1);
  }
};
