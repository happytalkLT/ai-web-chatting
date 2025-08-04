const { EntitySchema } = require('typeorm');

const ChatMessage = new EntitySchema({
  name: 'ChatMessage',
  tableName: 'chat_messages',
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
    messageType: {
      type: 'enum',
      enum: ['text', 'image', 'file', 'system', 'model'],
      default: 'text'
    },
    metadata: {
      type: 'json',
      nullable: true
    },
    isEdited: {
      type: 'boolean',
      default: false
    },
    editedAt: {
      type: 'datetime',
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
    isSummary: {
      type: 'boolean',
      default: false,
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
      target: 'ChatMessage',
      joinColumn: {
        name: 'replyToId'
      }
    },
    replies: {
      type: 'one-to-many',
      target: 'ChatMessage',
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

module.exports = ChatMessage;