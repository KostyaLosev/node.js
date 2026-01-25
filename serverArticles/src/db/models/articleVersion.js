module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'ArticleVersion',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      articleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      version: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      workspaceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      attachments: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
      },
    },
    {
      tableName: 'article_versions',
    }
  );
};
