const { Exercise } = require('../models');
module.exports = {
  list: async (req, res, next) => { try { const items = await Exercise.findAll(); res.json(items); } catch(err){ next(err); } },
  get: async (req, res, next) => { try { const item = await Exercise.findByPk(req.params.id); if(!item) return res.status(404).json({message:'Not found'}); res.json(item); } catch(err){ next(err); } },
  create: async (req, res, next) => { try { const item = await Exercise.create(req.body); res.status(201).json(item); } catch(err){ next(err); } },
  update: async (req, res, next) => { try { const item = await Exercise.findByPk(req.params.id); if(!item) return res.status(404).json({message:'Not found'}); await item.update(req.body); res.json(item); } catch(err){ next(err); } },
  remove: async (req, res, next) => { try { const item = await Exercise.findByPk(req.params.id); if(!item) return res.status(404).json({message:'Not found'}); await item.destroy(); res.status(204).send(); } catch(err){ next(err); } }
};
