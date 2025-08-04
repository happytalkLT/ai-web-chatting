const { EntitySchema } = require('typeorm');

const Token = new EntitySchema({
  name: 'Token',
  tableName: 'tokens',
  columns: {
    id: {
      type: 'varchar',
      primary: true,
      length: 36,
      generated: 'uuid'
    },
    userId: {
      type: 'varchar',
      nullable: false,
      length: 36
    },
    accessToken: {
      type: 'varchar',
      length: 500,
      nullable: false
    },
    refreshToken: {
      type: 'varchar',
      length: 500,
      nullable: false
    },
    isActive: {
      type: 'boolean',
      default: true
    },
    createdAt: {
      type: 'datetime',
      createDate: true
    },
    expiresAt: {
      type: 'datetime',
      nullable: false
    }
  },
  relations: {
    user: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: {
        name: 'userId'
      },
      onDelete: 'CASCADE'
    }
  },
  indices: [
    {
      name: 'IDX_TOKEN_USER_ID',
      columns: ['userId']
    },
    {
      name: 'IDX_TOKEN_ACCESS_TOKEN',
      columns: ['accessToken'],
      unique: true
    },
    {
      name: 'IDX_TOKEN_REFRESH_TOKEN',
      columns: ['refreshToken'],
      unique: true
    },
    {
      name: 'IDX_TOKEN_IS_ACTIVE',
      columns: ['isActive']
    }
  ]
});

module.exports = Token;