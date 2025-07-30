import { Model, DataTypes, Sequelize } from 'sequelize';

export class Like extends Model {
  declare userId: string;
  declare storyId: string;
  declare createdAt: Date;
}

export const defineLikeModel = (sequelize: Sequelize) => {
  Like.init(
    {
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'user', key: 'id' },
        onDelete: 'CASCADE',
      },
      storyId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'story', key: 'id' },
        onDelete: 'CASCADE',
      },
    },
    {
      sequelize,
      modelName: 'like',
      timestamps: true,
      updatedAt: false,
      indexes: [
        {
          unique: true,
          fields: ['userId', 'storyId'],
        },
      ],
    },
  );
  return Like;
};
