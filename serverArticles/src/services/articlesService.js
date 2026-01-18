const { Article, ArticleVersion, Comment, Workspace } = require('../db');

function serializeArticle(article, versionRecord, comments = []) {
  const plainVersion = versionRecord.get({ plain: true });
  const workspace = versionRecord.workspace
    ? { id: versionRecord.workspace.id, name: versionRecord.workspace.name }
    : null;

  return {
    id: article.id,
    title: plainVersion.title,
    content: plainVersion.content,
    createdAt: plainVersion.createdAt,
    updatedAt: plainVersion.updatedAt,
    workspaceId: plainVersion.workspaceId,
    workspace,
    attachments: plainVersion.attachments,
    comments,
    version: plainVersion.version,
    currentVersion: article.currentVersion,
    isLatest: plainVersion.version === article.currentVersion,
  };
}

async function findArticleVersion(articleId, version) {
  return ArticleVersion.findOne({
    where: { articleId, version },
    include: [{ model: Workspace, as: 'workspace', attributes: ['id', 'name'] }],
  });
}

async function createNewVersion(article, data) {
  const nextVersion = article.currentVersion + 1;
  const versionRecord = await ArticleVersion.create({
    articleId: article.id,
    version: nextVersion,
    title: data.title ?? article.title,
    content: data.content ?? article.content,
    workspaceId: data.workspaceId ?? article.workspaceId,
    attachments: data.attachments ?? article.attachments ?? [],
  });

  await article.update({
    title: data.title ?? article.title,
    content: data.content ?? article.content,
    workspaceId: data.workspaceId ?? article.workspaceId,
    attachments: data.attachments ?? article.attachments ?? [],
    currentVersion: nextVersion,
  });

  return versionRecord;
}

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
    currentVersion: article.currentVersion,
  }));
}

async function getArticleById(id, versionOverride = null) {
  const article = await Article.findByPk(id);
  if (!article) return null;

  const versionNumber = versionOverride ?? article.currentVersion;
  const versionRecord = await findArticleVersion(article.id, versionNumber);
  if (!versionRecord) return null;

  const comments = await Comment.findAll({
    where: { articleId: article.id },
    attributes: ['id', 'content', 'createdAt', 'updatedAt'],
    order: [['createdAt', 'ASC']],
  });

  return serializeArticle(article, versionRecord, comments.map((comment) => comment.get({ plain: true })));
}

async function createArticle({ title, content, workspaceId }) {
  const article = await Article.create({
    title,
    content,
    workspaceId,
    attachments: [],
    currentVersion: 1,
  });

  const versionRecord = await ArticleVersion.create({
    articleId: article.id,
    version: 1,
    title,
    content,
    workspaceId,
    attachments: [],
  });

  return serializeArticle(article, versionRecord, []);
}

async function updateArticle(id, { title, content, workspaceId }) {
  const article = await Article.findByPk(id);
  if (!article) return null;

  await createNewVersion(article, { title, content, workspaceId });
  return getArticleById(id);
}

async function deleteArticle(id) {
  const deleted = await Article.destroy({ where: { id } });
  return deleted > 0;
}

async function addAttachments(id, newFiles) {
  const article = await Article.findByPk(id);
  if (!article) return null;

  const existing = Array.isArray(article.attachments) ? article.attachments : [];
  await createNewVersion(article, { attachments: [...existing, ...newFiles] });
  return getArticleById(id);
}

async function removeAttachment(articleId, filename) {
  const article = await Article.findByPk(articleId);
  if (!article || !article.attachments) return null;

  const attachments = Array.isArray(article.attachments) ? article.attachments : [];
  const index = attachments.findIndex(att => att.filename === filename);
  if (index === -1) return getArticleById(articleId);

  attachments.splice(index, 1);
  await createNewVersion(article, { attachments });

  return getArticleById(articleId);
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

async function listArticleVersions(articleId) {
  const article = await Article.findByPk(articleId);
  if (!article) return null;

  const versions = await ArticleVersion.findAll({
    where: { articleId },
    order: [['version', 'DESC']],
    attributes: ['version', 'createdAt', 'updatedAt'],
  });

  return versions.map((version) => version.get({ plain: true }));
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
  listArticleVersions,
};
