const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const { Schema } = mongoose
mongoose.connect(process.env['MONGO_URI'], { useNewUrlParser: true, useUnifiedTopology: true })
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended:false}))

const UserSchema = new Schema({
  username: {
    type: String, 
    required: true
  },
  exercises: [
    {
      description: {
        type: String,
        required: true
      },
      duration: {
        type: Number,
        required: true
      },
      date: {
      type: Date,
      default: Date.now
      }
    }
  ],
})

const User = mongoose.model('User', UserSchema)

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', (req, res) => {
  const user = new User({username: req.body.username, exercises: []})
  user.save((err, user) => {
    if (err) console.log(err)
    res.json({"username": user.username, "_id": user._id})
  })
})

app.get('/api/users', (req, res) => {
  User.find({}, {__v:0}, (err, users) => {
    if (err) console.log(err)
    res.send(users)
  })
})

app.post('/api/users/:id/exercises', (req, res) => {
  const newExercise = {
    "description": req.body.description,
    "duration": req.body.duration,
    "date": req.body.date
  }
  User.findById(req.params.id, (err, existingUser) => {
    if (err) console.log(err)
    existingUser.exercises.push(newExercise)
    existingUser.save((err, updatedUser) => {
      if (err) console.log(err)
      res.json({"username": updatedUser.username, "exercises": updatedUser.exercises})
    })
  })
})

app.get('/delete/users', (req, res) => {
  User.remove({}, (err,info)=>{})
  res.send("Deleted Everything")
})

app.get('/api/users/:id/logs', (req, res) => {
  let { fromDate, toDate , limit } = req.body
  User.findOne({_id: req.params.id}, {"username":1, "exercises": 1, "_id": 0}).where('date').gte(fromDate).lte(toDate).limit(+limit)
  .exec((err, userLog) => {
    if (err) console.log(err)
    res.json({"username": userLog.username, "exercises": userLog.exercises, "_id": userLog._id, "count": userLog.exercises.length})
  })
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
