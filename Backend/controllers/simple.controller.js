const { Authors, Categories } = require('../models/simple.model');

exports.authors = {
  list:   async (_q,r) => r.json({ authors: await Authors.list() }),
  create: async (q,r)  => r.status(201).json(await Authors.create(q.body.name, q.body.bio)),
  update: async (q,r)  => { await Authors.update(q.params.id, q.body); r.json({ ok:true }); },
  remove: async (q,r)  => { await Authors.remove(q.params.id); r.json({ ok:true }); },
};

exports.categories = {
  list:   async (_q,r) => r.json({ categories: await Categories.list() }),
  create: async (q,r)  => r.status(201).json(await Categories.create(q.body.name)),
  update: async (q,r)  => { await Categories.update(q.params.id, q.body.name); r.json({ ok:true }); },
  remove: async (q,r)  => { await Categories.remove(q.params.id); r.json({ ok:true }); },
};
