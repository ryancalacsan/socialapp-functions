const { db } = require('../util/admin');

exports.getAllSparks = (req, res) => {
  db.collection('sparks')
    .orderBy('createdAt', 'desc')
    .get()
    .then((data) => {
      let sparks = [];
      data.forEach((doc) => {
        sparks.push({
          sparkId: doc.id,
          body: doc.data().body,
          userHandle: doc.data().userHandle,
          createdAt: doc.data().createdAt,
          commentCount: doc.data().commentCount,
          likeCount: doc.data().likeCount,
          userImage: doc.data().userImage,
        });
      });
      return res.json(sparks);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

exports.postOneSpark = (req, res) => {
  if (req.body.body.trim() === '') {
    return res.status(400).json({ body: 'Body must not be empty' });
  }

  const newSpark = {
    body: req.body.body,
    userHandle: req.user.handle,
    userImage: req.user.imageUrl,
    createdAt: new Date().toISOString(),
    likeCount: 0,
    commentCount: 0,
  };

  db.collection('sparks')
    .add(newSpark)
    .then((doc) => {
      const resSpark = newSpark;
      resSpark.sparkId = doc.id;
      res.json(resSpark);
    })
    .catch((err) => {
      res.status(500).json({ error: 'something went wrong' });
      console.error(err);
    });
};

//Fetch one spark
exports.getSpark = (req, res) => {
  let sparkData = {};
  db.doc(`/sparks/${req.params.sparkId}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: 'Spark not found' });
      }
      sparkData = doc.data();
      sparkData.sparkId = doc.id;
      return db
        .collection('comments')
        .orderBy('createdAt', 'desc')
        .where('sparkId', '==', req.params.sparkId)
        .get();
    })
    .then((data) => {
      sparkData.comments = [];
      data.forEach((doc) => {
        sparkData.comments.push(doc.data());
      });
      return res.json(sparkData);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

//Comment on spark
exports.commentOnSpark = (req, res) => {
  if (req.body.body.trim() === '')
    return res.status(400).json({ comment: 'Must not be empty' });

  const newComment = {
    body: req.body.body,
    createdAt: new Date().toISOString(),
    sparkId: req.params.sparkId,
    userHandle: req.user.handle,
    userImage: req.user.imageUrl,
  };

  db.doc(`/sparks/${req.params.sparkId}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: 'Spark not found' });
      }
      return doc.ref.update({ commentCount: doc.data().commentCount + 1 });
    })
    .then(() => {
      return db.collection('comments').add(newComment);
    })
    .then(() => {
      res.json(newComment);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: 'Something went wrong' });
    });
};

//Like a spark
exports.likeSpark = (req, res) => {
  const likeDocument = db
    .collection('likes')
    .where('userHandle', '==', req.user.handle)
    .where('sparkId', '==', req.params.sparkId)
    .limit(1);

  const sparkDocument = db.doc(`/sparks/${req.params.sparkId}`);

  let sparkData;

  sparkDocument
    .get()
    .then((doc) => {
      if (doc.exists) {
        sparkData = doc.data();
        sparkData.sparkId = doc.id;
        return likeDocument.get();
      } else {
        return res.status(404).json({ error: 'Spark not found' });
      }
    })
    .then((data) => {
      if (data.empty) {
        return db
          .collection('likes')
          .add({
            sparkId: req.params.sparkId,
            userHandle: req.user.handle,
          })
          .then(() => {
            sparkData.likeCount++;
            return sparkDocument.update({ likeCount: sparkData.likeCount });
          })
          .then(() => {
            return res.json(sparkData);
          });
      } else {
        return res.status(400).json({ error: 'Spark already liked' });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

exports.unlikeSpark = (req, res) => {
  const likeDocument = db
    .collection('likes')
    .where('userHandle', '==', req.user.handle)
    .where('sparkId', '==', req.params.sparkId)
    .limit(1);

  const sparkDocument = db.doc(`/sparks/${req.params.sparkId}`);

  let sparkData;

  sparkDocument
    .get()
    .then((doc) => {
      if (doc.exists) {
        sparkData = doc.data();
        sparkData.sparkId = doc.id;
        return likeDocument.get();
      } else {
        return res.status(404).json({ error: 'Spark not found' });
      }
    })
    .then((data) => {
      if (data.empty) {
        return res.status(400).json({ error: 'Spark not liked' });
      } else {
        return db
          .doc(`/likes/${data.docs[0].id}`)
          .delete()
          .then(() => {
            sparkData.likeCount--;
            return sparkDocument.update({ likeCount: sparkData.likeCount });
          })
          .then(() => {
            res.json(sparkData);
          });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

//Delete a spark
exports.deleteSpark = (req, res) => {
  const document = db.doc(`/sparks/${req.params.sparkId}`);
  document
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: 'Spark not found' });
      }
      if (doc.data().userHandle !== req.user.handle) {
        return res.status(403).json({ error: 'Unauthorized' });
      } else {
        return document.delete();
      }
    })
    .then(() => {
      res.json({ message: 'Spark deleted successfully' });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};
