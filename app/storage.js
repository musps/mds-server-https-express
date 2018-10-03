const redis = require('redis');
const redisClient = redis.createClient({
  db: 0,
  host: (process.env.REDIS_HOSTNAME || '127.0.0.1'),
  port: (process.env.REDIS_POST || 6379);
});

const users = {
  parseRedisUsername: function(username) {
    return `user:${username}`;
  },
  create: function(username, password) {
    const user = { username, password };
    return redisClient.set(users.parseRedisUsername(username), JSON.stringify(user), redis.print);
  },
  findByUsername: async function(username) {
    return new Promise(function(resolve, reject) {
      const user = redisClient.get(users.parseRedisUsername(username), function(err, data) {
        if (data === null) {
          resolve('USER_NOT_FOUND');
        } else {
          try {
            resolve(JSON.parse(data));
          } catch(e) {
            resolve('USER_PARSE_ERROR');
          }
        }
      });
    });
  }
};

const messages = {
  key: 'messages',
  removeByKey: function(key) {
    // In progress.
  },
  create: function(username, value) {
    const createdAt = Date.now();
    const message = { 
      username,
      value,
      createdAt,
      key: Buffer.from(`${createdAt}.${username}`).toString('base64')
    };
    return redisClient.lpush(messages.key, JSON.stringify(message), redis.print);
  },
  getAll: function() {
    return new Promise(function(resolve, reject) {
      redisClient.lrange(messages.key, 0, -1, function(err, data) {
        resolve(data.map(item => (JSON.parse(item) || [])));
      });
    });
  }
};

module.exports = {
  users,
  messages
};
