const mongoose = require('mongoose');
const clickSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  referrer: {
    type: String,
    default: 'direct'
  },
  ipAddress: {
    type: String,
    required: true
  },
  location: {
    country: String,
    region: String,
    city: String
  }
});
const urlSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true,
    validate: {
      validator: function(url) {
        const urlPattern = /^https?:\/\/.+/;
        return urlPattern.test(url);
      },
      message: 'Please provide a valid URL starting with http:// or https://'
    }
  },
  shortcode: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  },
  validityMinutes: {
    type: Number,
    default: 30
  },
  clicks: [clickSchema],
  totalClicks: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

urlSchema.index({ shortcode: 1 });
urlSchema.index({ expiresAt: 1 });

urlSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

urlSchema.methods.addClick = function(clickData) {
  this.clicks.push(clickData);
  this.totalClicks += 1;
  return this.save();
};
module.exports = mongoose.model('Url', urlSchema);