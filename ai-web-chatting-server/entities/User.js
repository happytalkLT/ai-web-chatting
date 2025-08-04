const { EntitySchema } = require('typeorm');

const User = new EntitySchema({
  name: 'User',
  tableName: 'users',
  columns: {
    id: {
      type: 'varchar',
      primary: true,
      length: 36,
      generated: 'uuid'
    },
    email: {
      type: 'varchar',
      unique: true,
      nullable: false,
      length: 255
    },
    password: {
      type: 'varchar',
      nullable: false,
      length: 255
    },
    name: {
      type: 'varchar',
      nullable: false,
      length: 100
    },
    profileImage: {
      type: 'text',
      nullable: true
    },
    isActive: {
      type: 'boolean',
      default: true
    },
    lastLoginAt: {
      type: 'datetime',
      nullable: true
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
  indices: [
    {
      name: 'IDX_USER_EMAIL',
      columns: ['email']
    },
    {
      name: 'IDX_USER_CREATED_AT',
      columns: ['createdAt']
    }
  ]
});

module.exports = User;