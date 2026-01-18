'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('articles', 'currentVersion', {
      allowNull: false,
      type: Sequelize.INTEGER,
      defaultValue: 1,
    });

    await queryInterface.createTable('article_versions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      articleId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'articles',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      version: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      title: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      content: {
        allowNull: false,
        type: Sequelize.TEXT,
      },
      workspaceId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'workspaces',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      attachments: {
        allowNull: false,
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addConstraint('article_versions', {
      fields: ['articleId', 'version'],
      type: 'unique',
      name: 'article_versions_article_version_unique',
    });

    await queryInterface.sequelize.query(`
      INSERT INTO article_versions ("articleId", "version", "title", "content", "workspaceId", "attachments", "createdAt", "updatedAt")
      SELECT id, 1, title, content, "workspaceId", attachments, "createdAt", "updatedAt" FROM articles;
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('article_versions');
    await queryInterface.removeColumn('articles', 'currentVersion');
  },
};
