const { EntitySchema } = require('typeorm');

const ChatSummary = new EntitySchema({
  name: 'ChatSummary',
  tableName: 'chat_summaries',
  columns: {
    id: {
      type: 'varchar',
      primary: true,
      length: 36,
      generated: 'uuid'
    },
    content: {
      type: 'text',
      nullable: false,
      charset: 'utf8mb4',
      collation: 'utf8mb4_unicode_ci'
    },

    metadata: {
      type: 'json',
      nullable: true
    },

    isDeleted: {
      type: 'boolean',
      default: false
    },
    deletedAt: {
      type: 'datetime',
      nullable: true
    },
    chatRoomId: {
      type: 'varchar',
      nullable: false,
      length: 36
    },
    senderId: {
      type: 'varchar',
      nullable: false,
      length: 36
    },
    replyToId: {
      type: 'varchar',
      nullable: true,
      length: 36
    },
    createdAt: {
      type: 'datetime',
      createDate: true
    },
    updatedAt: {
      type: 'datetime',
      updateDate: true
    }
  },
  relations: {
    chatRoom: {
      type: 'many-to-one',
      target: 'ChatRoom',
      joinColumn: {
        name: 'chatRoomId'
      }
    },
    sender: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: {
        name: 'senderId'
      }
    },
    replyTo: {
      type: 'many-to-one',
      target: 'ChatSummary',
      joinColumn: {
        name: 'replyToId'
      }
    },
    replies: {
      type: 'one-to-many',
      target: 'ChatSummary',
      inverseSide: 'replyTo'
    }
  },
  indices: [
    {
      name: 'IDX_CHAT_MESSAGE_ROOM_ID',
      columns: ['chatRoomId']
    },
    {
      name: 'IDX_CHAT_MESSAGE_SENDER_ID',
      columns: ['senderId']
    },
    {
      name: 'IDX_CHAT_MESSAGE_CREATED_AT',
      columns: ['createdAt']
    }
  ]
});

module.exports = ChatSummary;