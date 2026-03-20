import ResourcesNotification from '../models/ResourcesNotification.model.js';

export const createNotification = async ({
  userId,
  actorId = null,
  type,
  title,
  message,
  link = '',
  metadata = {},
}) => {
  if (!userId || !type || !title || !message) return null;
  return ResourcesNotification.create({
    userId,
    actorId,
    type,
    title,
    message,
    link,
    metadata,
  });
};
