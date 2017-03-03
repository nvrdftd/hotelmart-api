module.exports = {
  port: process.env.PORT || 3000,
  mongodb: process.env.MONGODB_URI || 'mongodb://localhost:20001, localhost:20002/hotelmart?replicaSet=hotelmart',
  origin: 'https://whispering-gorge-20840.herokuapp.com'
}
