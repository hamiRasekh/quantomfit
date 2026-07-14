import { fSub } from '@/ui/utils/format-time';

import { _mock } from './_mock';

// ----------------------------------------------------------------------

export const _chatContacts = Array.from({ length: 20 }, (_, index) => {
  const status =
    (index % 2 && 'online') || (index % 3 && 'offline') || (index % 4 && 'always') || 'busy';

  return {
    id: _mock.id(index),
    status,
    role: _mock.role(index),
    email: _mock.email(index),
    name: _mock.fullName(index),
    phoneNumber: _mock.phoneNumber(index),
    lastActivity: _mock.time(index),
    avatarUrl: _mock.image.avatar(index),
    address: _mock.fullAddress(index),
  };
});

// ----------------------------------------------------------------------

export const _chatMessages = Array.from({ length: 50 }, (_, index) => {
  const content = _mock.sentence(index);
  const contentType = index % 2 ? 'text' : 'image';
  const attachments = contentType === 'image' ? [_mock.image.cover(index)] : [];

  return {
    id: _mock.id(index),
    body: content,
    contentType,
    attachments,
    createdAt: fSub({ days: index, hours: index, minutes: index }),
    senderId: _mock.id(index % 5),
  };
});

// ----------------------------------------------------------------------

export const _chatConversations = Array.from({ length: 20 }, (_, index) => {
  const participants = _chatContacts.slice(0, index % 3 + 2);
  const messages = _chatMessages.slice(0, index % 10 + 5);

  return {
    id: _mock.id(index),
    type: participants.length > 2 ? 'GROUP' : 'ONE_TO_ONE',
    unreadCount: index % 3,
    participants,
    messages,
  };
});
