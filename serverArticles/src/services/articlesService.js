const { Article, Comment, Workspace } = require('../db');

async function listArticles(workspaceId) {
  const where = {};
  if (workspaceId) {
    where.workspaceId = workspaceId;
  }

  const articles = await Article.findAll({
    where,
    include: [{ model: Workspace, as: 'workspace', attributes: ['id', 'name'] }],
    order: [['createdAt', 'DESC']],
  });

  return articles.map((article) => ({
    id: article.id,
    title: article.title,
    createdAt: article.createdAt,
    workspaceId: article.workspaceId,
    workspace: article.workspace ? { id: article.workspace.id, name: article.workspace.name } : null,
  }));
}

async function getArticleById(id) {
  const article = await Article.findByPk(id, {
    include: [
      { model: Workspace, as: 'workspace', attributes: ['id', 'name'] },
      { model: Comment, as: 'comments', attributes: ['id', 'content', 'createdAt', 'updatedAt'] },
    ],
    order: [[{ model: Comment, as: 'comments' }, 'createdAt', 'ASC']],
  });

  return article ? article.get({ plain: true }) : null;
}

async function createArticle({ title, content, workspaceId }) {
  const article = await Article.create({
    title,
    content,
    workspaceId,
    attachments: [],
  });

  return article.get({ plain: true });
}

async function updateArticle(id, { title, content, workspaceId }) {
  const article = await Article.findByPk(id);
  if (!article) return null;

  article.title = title;
  article.content = content;
  if (workspaceId) {
    article.workspaceId = workspaceId;
  }

  await article.save();
  return article.get({ plain: true });
}

async function deleteArticle(id) {
  const deleted = await Article.destroy({ where: { id } });
  return deleted > 0;
}

async function addAttachments(id, newFiles) {
  const article = await Article.findByPk(id);
  if (!article) return null;

  const existing = Array.isArray(article.attachments) ? article.attachments : [];
  article.attachments = [...existing, ...newFiles];
  await article.save();
  return article.get({ plain: true });
}

async function removeAttachment(articleId, filename) {
  const article = await Article.findByPk(articleId);
  if (!article || !article.attachments) return null;

  const attachments = Array.isArray(article.attachments) ? article.attachments : [];
  const index = attachments.findIndex(att => att.filename === filename);
  if (index === -1) return article.get({ plain: true });

  attachments.splice(index, 1);
  article.attachments = attachments;
  await article.save();

  return article.get({ plain: true });
}

async function listComments(articleId) {
  return Comment.findAll({
    where: { articleId },
    order: [['createdAt', 'ASC']],
  });
}

async function addComment(articleId, content) {
  const comment = await Comment.create({ articleId, content });
  return comment.get({ plain: true });
}

async function updateComment(articleId, commentId, content) {
  const comment = await Comment.findOne({ where: { id: commentId, articleId } });
  if (!comment) return null;

  comment.content = content;
  await comment.save();
  return comment.get({ plain: true });
}

async function deleteComment(articleId, commentId) {
  const deleted = await Comment.destroy({ where: { id: commentId, articleId } });
  return deleted > 0;
}


module.exports = {
  listArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  addAttachments,
  removeAttachment,
  listComments,
  addComment,
  updateComment,
  deleteComment,
};
