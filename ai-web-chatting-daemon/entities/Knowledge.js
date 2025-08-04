const {EntitySchema} = require("typeorm");
const Knowledge = new EntitySchema({
  name: 'Knowledge',
  tableName: 'knowledge',
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
    title: {
      type: 'varchar',
      length: 100,
      nullable: false,
      charset: 'utf8mb4',
      collation: 'utf8mb4_unicode_ci'
    },
    category: {
      type: 'varchar',
      length: 20,
      nullable: true,
      charset: 'utf8mb4',
      collation: 'utf8mb4_unicode_ci'
    },
    source: {
      type: 'varchar',
      length: 20,
      nullable: true,
      charset: 'utf8mb4',
      collation: 'utf8mb4_unicode_ci'
    },
    knowledgeType: {
      type: 'enum',
      enum: ['text'],
      default: 'text'
    },
    chunk: {
      type: 'json',
      nullable: true
    },
    uploaderId: {
      type: 'varchar',
      nullable: false,
      length: 36
    },
    isDeleted: {
      type: 'boolean',
      default: false
    },
    deletedAt: {
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
    },
    isSync: {
      type: 'boolean',
      default: false
    }
  },
  relations: {
    uploader: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: {
        name: 'uploaderId'
      }
    }
  },
  indices: [
    {
      name: 'IDX_KNOWLEDGE_UPLOADER_ID',
      columns: ['uploaderId']
    },
    {
      name: 'IDX_KNOWLEDGE_CREATED_AT',
      columns: ['createdAt']
    }
  ]
})

module.exports = Knowledge;