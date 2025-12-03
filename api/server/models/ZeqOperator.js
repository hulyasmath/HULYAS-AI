const { ZeqOperator } = require('~/db/models');

const getZeqOperators = async ({ search, category, tags } = {}) => {
  const filter = {};

  if (search) {
    const regex = new RegExp(search, 'i');
    filter.$or = [{ name: regex }, { description: regex }, { equation: regex }, { tags: regex }];
  }

  if (category) {
    filter.category = category;
  }

  if (tags && tags.length) {
    filter.tags = { $in: tags };
  }

  return ZeqOperator.find(filter).sort({ name: 1 }).lean();
};

const createZeqOperator = async (data) => {
  const operator = new ZeqOperator(data);
  return operator.save();
};

const updateZeqOperator = async (id, updates) => {
  return ZeqOperator.findByIdAndUpdate(id, updates, { new: true });
};

const deleteZeqOperator = async (id) => {
  return ZeqOperator.findByIdAndDelete(id);
};

module.exports = {
  getZeqOperators,
  createZeqOperator,
  updateZeqOperator,
  deleteZeqOperator,
};




