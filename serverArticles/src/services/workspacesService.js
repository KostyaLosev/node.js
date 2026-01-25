const { Workspace } = require('../db');

async function listWorkspaces() {
  const workspaces = await Workspace.findAll({
    order: [['name', 'ASC']],
  });
  return workspaces.map((workspace) => workspace.get({ plain: true }));
}

module.exports = { listWorkspaces };
