import { Option } from './associations'

const OptionController = {
  getAll: async () => {
    return await Option.findAll()
  },
  getById: async id => {
    return await Option.findOne({ where: { option_id: id } })
  },
  create: async data => {
    return await Option.create(data)
  },
  update: async (id, data) => {
    return await Option.update(data, { where: { option_id: id } })
  },
  delete: async id => {
    return await Option.destroy({ where: { option_id: id } })
  },
}

export default OptionController
