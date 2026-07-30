import prisma from "../../config/db.config.js";

export const findAllUsers = ({ role, page = 1, limit = 20 }) => {
  const where = role ? { role } : {};
  return prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      isVerified: true,
      createdAt: true,
    },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: "desc" },
  });
};

export const countUsers = (role) => {
  const where = role ? { role } : {};
  return prisma.user.count({ where });
};

export const findUserByIdRaw = (id) => {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      isVerified: true,
      createdAt: true,
    },
  });
};

export const setUserActiveStatus = (id, isActive) => {
  return prisma.user.update({ where: { id }, data: { isActive } });
};

export const findUserAvatarById = (id) => {
  return prisma.user.findUnique({ where: { id }, select: { id: true, avatar: true } });
};

export const updateUserAvatar = (id, avatar) => {
  return prisma.user.update({
    where: { id },
    data: { avatar },
    select: { id: true, name: true, email: true, role: true, avatar: true },
  });
};