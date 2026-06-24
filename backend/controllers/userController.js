const { Op } = require("sequelize");
const { User, Order } = require("../models");

// @route GET /api/admin/users (admin only)
const getUsers = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const where = { role: "customer" };
    if (search) {
      where[Op.or] = [
        { first_name: { [Op.like]: `%${search}%` } },
        { last_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(parseInt(limit, 10) || 20, 100);

    const { count, rows } = await User.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      limit: limitNum,
      offset: (pageNum - 1) * limitNum,
    });

    res.json({
      users: rows,
      pagination: { total: count, page: pageNum, limit: limitNum, total_pages: Math.ceil(count / limitNum) },
    });
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/admin/users/:id/block (admin only)
const toggleBlockUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    if (user.role === "admin") return res.status(400).json({ message: "Cannot block an admin account." });

    user.is_blocked = !user.is_blocked;
    await user.save();
    res.json({ message: user.is_blocked ? "User blocked." : "User unblocked.", user });
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/admin/users/:id (admin only)
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    if (user.role === "admin") return res.status(400).json({ message: "Cannot delete an admin account." });

    await user.destroy();
    res.json({ message: "User deleted." });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, toggleBlockUser, deleteUser };
