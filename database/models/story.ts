import { DataTypes, Sequelize, Model } from 'sequelize';

class Story extends Model {
  declare id: string;
  declare title: string;
  declare description: string;
  declare authorId: string;
  declare lastModifierId: string;
  declare lastModificationTime: Date;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

export const defineStoryModel = (sequelize: Sequelize) => {
  Story.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      authorId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'user',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      lastModifierId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      lastModificationTime: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'Story',
      tableName: 'story',
      timestamps: true,
    },
  );
  return Story;
};
