'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('workspaces', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING,
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

    const now = new Date();
    await queryInterface.bulkInsert('workspaces', [
      { id: 1, name: 'General', createdAt: now, updatedAt: now },
      { id: 2, name: 'Product', createdAt: now, updatedAt: now },
      { id: 3, name: 'Research', createdAt: now, updatedAt: now },
    ]);

    await queryInterface.addColumn('articles', 'workspaceId', {
      allowNull: false,
      type: Sequelize.INTEGER,
      defaultValue: 1,
      references: {
        model: 'workspaces',
        key: 'id',
      },
      onDelete: 'CASCADE',
    });

    await queryInterface.addColumn('articles', 'attachments', {
      allowNull: false,
      type: Sequelize.JSONB,
      defaultValue: [],
    });

    await queryInterface.createTable('comments', {
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
      content: {
        allowNull: false,
        type: Sequelize.TEXT,
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
  },

  async down(queryInterface) {
    await queryInterface.dropTable('comments');
    await queryInterface.removeColumn('articles', 'attachments');
    await queryInterface.removeColumn('articles', 'workspaceId');
    await queryInterface.dropTable('workspaces');
  },
};
