const { EntitySchema } = require('typeorm');

const ChatRoom = new EntitySchema({
  name: 'ChatRoom',
  tableName: 'chat_rooms',
  columns: {
    id: {
      type: 'varchar',
      primary: true,
      length: 36,
      generated: 'uuid'
    },
    name: {
      type: 'varchar',
      nullable: false,
      length: 255
    },
    description: {
      type: 'text',
      nullable: true
    },
    type: {
      type: 'enum',
      enum: ['public', 'private', 'group'],
      default: 'public'
    },
    maxParticipants: {
      type: 'int',
      nullable: true,
      default: null
    },
    isActive: {
      type: 'boolean',
      default: true
    },
    createdBy: {
      type: 'varchar',
      nullable: false,
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
    creator: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: {
        name: 'createdBy'
      }
    },
    participants: {
      type: 'one-to-many',
      target: 'ChatParticipant',
      inverseSide: 'chatRoom'
    },
    messages: {
      type: 'one-to-many',
      target: 'ChatMessage',
      inverseSide: 'chatRoom'
    }
  },
  indices: [
    {
      name: 'IDX_CHAT_ROOM_TYPE',
      columns: ['type']
    },
    {
      name: 'IDX_CHAT_ROOM_CREATED_BY',
      columns: ['createdBy']
    }
  ]
});

module.exports = ChatRoom;