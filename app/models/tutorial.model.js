const { DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  const Tutorial = sequelize.define('Tutorial', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Title cannot be empty'
        },
        len: {
          args: [3, 255],
          msg: 'Title must be between 3 and 255 characters'
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 2000],
          msg: 'Description cannot exceed 2000 characters'
        }
      }
    },
    published: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      validate: {
        isBoolean: {
          msg: 'Published must be a boolean value'
        }
      }
    },
    slug: {
      type: DataTypes.STRING(300),
      allowNull: true,
      unique: true,
      validate: {
        is: {
          args: /^[a-z0-9-]+$/,
          msg: 'Slug must contain only lowercase letters, numbers, and hyphens'
        }
      }
    },
    author: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: {
          args: [2, 100],
          msg: 'Author name must be between 2 and 100 characters'
        }
      }
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    view_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: {
          args: 0,
          msg: 'View count cannot be negative'
        }
      }
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    // Model options
    tableName: 'tutorials',
    timestamps: true,
    paranoid: true, // Enable soft deletes
    underscored: true,
    
    // Indexes for better performance
    indexes: [
      {
        fields: ['title']
      },
      {
        fields: ['published']
      },
      {
        fields: ['slug'],
        unique: true
      },
      {
        fields: ['author']
      },
      {
        fields: ['created_at']
      },
      {
        fields: ['published', 'created_at']
      }
    ],
    
    // Hooks for additional functionality
    hooks: {
      beforeCreate: (tutorial) => {
        // Generate slug if not provided
        if (!tutorial.slug && tutorial.title) {
          tutorial.slug = tutorial.title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-');
        }
      },
      beforeUpdate: (tutorial) => {
        // Update slug if title changed
        if (tutorial.changed('title') && tutorial.title) {
          tutorial.slug = tutorial.title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-');
        }
      }
    },
    
    // Scopes for common queries
    scopes: {
      published: {
        where: {
          published: true
        }
      },
      unpublished: {
        where: {
          published: false
        }
      },
      withAuthor: {
        where: {
          author: {
            [Sequelize.Op.ne]: null
          }
        }
      },
      recent: {
        order: [['created_at', 'DESC']]
      }
    }
  });

  // Instance methods
  Tutorial.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    
    // Remove sensitive or unnecessary fields if needed
    delete values.deleted_at;
    
    return values;
  };

  Tutorial.prototype.incrementViewCount = async function() {
    await this.increment('view_count');
  };

  // Class methods
  Tutorial.findBySlug = function(slug) {
    return this.findOne({ where: { slug } });
  };

  Tutorial.findPublished = function(options = {}) {
    return this.scope('published').findAll(options);
  };

  Tutorial.search = function(query, options = {}) {
    return this.findAll({
      where: {
        [Sequelize.Op.or]: [
          { title: { [Sequelize.Op.like]: `%${query}%` } },
          { description: { [Sequelize.Op.like]: `%${query}%` } }
        ]
      },
      ...options
    });
  };

  return Tutorial;
};
