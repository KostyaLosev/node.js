const { Sequelize, DataTypes } = require('sequelize');
const config = require('./config');

const environment = process.env.NODE_ENV || 'development';
const sequelize = new Sequelize(config[environment]);

const Article = require('./models/article')(sequelize, DataTypes);
const ArticleVersion = require('./models/articleVersion')(sequelize, DataTypes);
const Comment = require('./models/comment')(sequelize, DataTypes);
const Workspace = require('./models/workspace')(sequelize, DataTypes);
const User = require('./models/user')(sequelize, DataTypes);

Workspace.hasMany(Article, { foreignKey: 'workspaceId', as: 'articles' });
Article.belongsTo(Workspace, { foreignKey: 'workspaceId', as: 'workspace' });

Workspace.hasMany(ArticleVersion, { foreignKey: 'workspaceId', as: 'articleVersions' });
ArticleVersion.belongsTo(Workspace, { foreignKey: 'workspaceId', as: 'workspace' });

Article.hasMany(ArticleVersion, { foreignKey: 'articleId', as: 'versions', onDelete: 'CASCADE' });
ArticleVersion.belongsTo(Article, { foreignKey: 'articleId', as: 'article' });

Article.hasMany(Comment, { foreignKey: 'articleId', as: 'comments', onDelete: 'CASCADE' });
Comment.belongsTo(Article, { foreignKey: 'articleId', as: 'article' });

User.hasMany(Article, { foreignKey: 'userId', as: 'articles' });
Article.belongsTo(User, { foreignKey: 'userId', as: 'author' });

module.exports = {
  sequelize,
  Article,
  ArticleVersion,
  Comment,
  Workspace,
  User,
};
