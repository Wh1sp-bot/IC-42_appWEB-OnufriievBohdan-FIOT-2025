const { Program } = require('../models');
module.exports = {
  list: async (req, res, next) => { try { const items = await Program.findAll(); res.json(items); } catch(err){ next(err); } },
  get: async (req, res, next) => { try { const item = await Program.findByPk(req.params.id); if(!item) return res.status(404).json({message:'Not found'}); res.json(item); } catch(err){ next(err); } },
  create: async (req, res, next) => { try { const item = await Program.create(req.body); res.status(201).json(item); } catch(err){ next(err); } },
  update: async (req, res, next) => { try { const item = await Program.findByPk(req.params.id); if(!item) return res.status(404).json({message:'Not found'}); await item.update(req.body); res.json(item); } catch(err){ next(err); } },
  remove: async (req, res, next) => { try { const item = await Program.findByPk(req.params.id); if(!item) return res.status(404).json({message:'Not found'}); await item.destroy(); res.status(204).send(); } catch(err){ next(err); } }
};
