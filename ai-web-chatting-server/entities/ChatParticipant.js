const { EntitySchema } = require('typeorm');

const ChatParticipant = new EntitySchema({
  name: 'ChatParticipant',
  tableName: 'chat_participants',
  columns: {
    id: {
      type: 'varchar',
      primary: true,
      length: 36,
      generated: 'uuid'
    },
    chatRoomId: {
      type: 'varchar',
      nullable: false,
      length: 36
    },
    userId: {
      type: 'varchar',
      nullable: false,
      length: 36
    },
    role: {
      type: 'enum',
      enum: ['admin', 'moderator', 'member'],
      default: 'member'
    },
    nickname: {
      type: 'varchar',
      nullable: true,
      length: 100
    },
    isActive: {
      type: 'boolean',
      default: true
    },
    lastReadAt: {
      type: 'datetime',
      nullable: true
    },
    joinedAt: {
      type: 'datetime',
      createDate: true
    },
    leftAt: {
      type: 'datetime',
      nullable: true
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
    user: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: {
        name: 'userId'
      }
    }
  },
  indices: [
    {
      name: 'IDX_CHAT_PARTICIPANT_ROOM_USER',
      columns: ['chatRoomId', 'userId'],
      unique: true
    },
    {
      name: 'IDX_CHAT_PARTICIPANT_USER_ID',
      columns: ['userId']
    }
  ]
});

module.exports = ChatParticipant;