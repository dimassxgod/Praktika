// Временная заглушка для БД
console.log('⚠️  База данных временно отключена');

// Заглушка для совместимости
const db = {
  collection: () => ({
    findOne: () => Promise.resolve(null),
    find: () => ({
      project: () => ({
        sort: () => ({
          toArray: () => Promise.resolve([])
        })
      })
    })
  })
};

const client = {
  close: () => Promise.resolve()
};

module.exports = { db, client };