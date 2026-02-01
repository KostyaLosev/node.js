const { User } = require('../db');

async function listUsers() {
  const users = await User.findAll({
    attributes: ['id', 'email', 'role'],
    order: [['id', 'ASC']],
  });

  return users.map((user) => user.get({ plain: true }));
}

async function updateUserRole(id, role) {
  const user = await User.findByPk(id);
  if (!user) return null;

  user.role = role;
  await user.save();

  return user.get({ plain: true });
}

module.exports = {
  listUsers,
  updateUserRole,
};
