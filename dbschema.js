const { stringify } = require('querystring');

let db = {
  users: [
    {
      userId: '321lk4j321kj41h31klj34hdaskfj',
      email: 'user@email.com',
      handle: 'user',
      createdAt: '2019-03-15T11:46:01.018Z',
      imageUrl: 'image/adsfkaldsfkj32434/kldsjfls',
      bio: 'Hellom my name is user, nice to meet you',
      website: `https://user.com`,
      location: 'Chicago, IL',
    },
  ],
  sparks: [
    {
      userHandle: 'user',
      body: 'this is the spark body',
      createdAt: '2019-03-15T11:46:01.018Z',
      likeCount: 5,
      commentCount: 2,
    },
  ],
  comments: [
    {
      userHandle: 'user',
      sparkId: '123lkkjkj',
      body: 'nice one mate!',
      createdAt: '2019-03-15T11:46:01.018Z',
    },
  ],
  notifications: [
    {
      recipient: 'user',
      sender: 'john',
      read: 'true|false',
      sparkId: 'aldkjflkdlsjfa',
      type: 'like|comment',
      createdAt: '2019-03-15T11:46:01.018Z',
    },
  ],
  likes: [
    {
      userHandle: 'user',
      sparkId: '123lkkjkj',
    },
  ],
};
