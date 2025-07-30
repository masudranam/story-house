import { DataTypes, Model, Sequelize } from 'sequelize';

export class Comment extends Model {
  declare id: string;
  declare storyId: string;
  declare userId: string;
  declare content: string;
  declare createdAt: Date;
}

export const defineCommentModel = (sequelize: Sequelize) => {
  Comment.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      storyId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'story',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'user',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      content: { type: DataTypes.TEXT, allowNull: false },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'Comment',
      tableName: 'comment',
      freezeTableName: true,
      timestamps: true,
      updatedAt: false,
    },
  );
  return Comment;
};
