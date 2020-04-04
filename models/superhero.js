
const mongoose = require('mongoose');
const Comment = require('./comment');

const supheroSchema = new mongoose.Schema({
  name: String,
  image: String,
  description: String,
  author: {
   id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
   },
   username: String
   },
  comments: [
    {
       type: mongoose.Schema.Types.ObjectId,
       ref: "Comment"
    }
 ]
}, { collection: 'superheroes' }); //Set a different name for your collection


supheroSchema.pre('remove', async function() {
	await Comment.remove({
		_id: {
			$in: this.comments
		}
	});
});

module.exports = mongoose.model("Superhero",supheroSchema);